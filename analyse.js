export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pdfBase64 } = req.body || {};
  if (!pdfBase64) return res.status(400).json({ error: 'No PDF data provided' });
  if (!pdfBase64.startsWith('JVBERi'))
    return res.status(400).json({ error: 'Invalid file — please upload a PDF drawing' });

  const prompt = 'You are a structural steel estimator. Extract all steel members from this drawing. Reply with ONLY a JSON object, nothing else:\n{"hotRolled":[{"dwg":"","type":"","section":"","length":0,"qty":0,"kgm":0,"m2m":0,"notes":""}],"coldRolled":[{"dwg":"","type":"","section":"","length":0,"qty":0,"kgm":0,"notes":""}]}\ntype=Column/Beam/Rafter/Bracing/Purlin/Rail etc, section=full UK designation e.g.203x203x46UC, length in mm, kgm from UK section tables.';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    const respText = await response.text();

    if (!response.ok) {
      let errMsg = 'API error ' + response.status;
      try {
        const e = JSON.parse(respText);
        errMsg = e.error?.message || errMsg;
      } catch(_) {}
      return res.status(502).json({ error: errMsg });
    }

    const data = JSON.parse(respText);
    if (data.type === 'error') return res.status(502).json({ error: data.error?.message || 'AI error' });

    const raw = data.content.filter(c => c.type === 'text').map(c => c.text).join('').trim();

    let parsed;
    try {
      const first = raw.indexOf('{');
      const last = raw.lastIndexOf('}');
      parsed = JSON.parse(raw.slice(first, last + 1));
    } catch(e) {
      return res.status(502).json({ error: 'Could not parse AI response: ' + raw.slice(0, 200) });
    }

    return res.status(200).json({
      hotRolled: Array.isArray(parsed.hotRolled) ? parsed.hotRolled : [],
      coldRolled: Array.isArray(parsed.coldRolled) ? parsed.coldRolled : []
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
