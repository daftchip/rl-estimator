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

  const prompt = `Extract steel members from this structural drawing. Be concise.
Return ONLY this JSON, no other text, no markdown:
{"hotRolled":[{"dwg":"","type":"","section":"","length":0,"qty":0,"kgm":0,"m2m":0}],"coldRolled":[{"dwg":"","type":"","section":"","length":0,"qty":0,"kgm":0}]}
Rules: type=Column/Beam/Rafter/Brace/Purlin/Rail, section=UK code e.g.203x203x46UC, length in mm, kgm from tables, omit notes field entirely.`;

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
        max_tokens: 8192,
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
      try { const e = JSON.parse(respText); errMsg = e.error?.message || errMsg; } catch(_) {}
      return res.status(502).json({ error: errMsg });
    }

    let data;
    try { data = JSON.parse(respText); }
    catch(e) { return res.status(502).json({ error: 'Invalid response from AI service' }); }

    if (data.type === 'error') return res.status(502).json({ error: data.error?.message || 'AI error' });

    const stopReason = data.stop_reason || '';
    const raw = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();

    if (!raw) return res.status(502).json({ error: 'No response from AI' });

    let jsonStr = raw;
    if (stopReason === 'max_tokens' || !raw.endsWith('}')) {
      let openBraces = 0, openBrackets = 0;
      const lastComplete = raw.lastIndexOf('}');
      let repair = lastComplete > 0 ? raw.slice(0, lastComplete + 1) : raw;
      for (const ch of repair) {
        if (ch === '{') openBraces++;
        else if (ch === '}') openBraces--;
        else if (ch === '[') openBrackets++;
        else if (ch === ']') openBrackets--;
      }
      for (let i = 0; i < openBrackets; i++) repair += ']';
      for (let i = 0; i < openBraces; i++) repair += '}';
      jsonStr = repair;
    }

    let parsed;
    try {
      const first = jsonStr.indexOf('{');
      const last = jsonStr.lastIndexOf('}');
      if (first === -1 || last === -1) throw new Error('No JSON');
      parsed = JSON.parse(jsonStr.slice(first, last + 1));
    } catch(e) {
      return res.status(502).json({ error: 'Could not parse response. Drawing may be too complex — try a simpler drawing first.' });
    }

    return res.status(200).json({
      hotRolled: Array.isArray(parsed.hotRolled) ? parsed.hotRolled : [],
      coldRolled: Array.isArray(parsed.coldRolled) ? parsed.coldRolled : []
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


