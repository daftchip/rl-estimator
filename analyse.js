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

  // Ask for CSV format instead of JSON — much more compact, won't get cut off
  const prompt = `Extract all steel members from this structural drawing.
Return ONLY a CSV table with these exact columns, no headers, no explanation:
HOT,dwg,type,section,length_mm,qty,kgm,m2m
COLD,dwg,type,section,length_mm,qty,kgm

One member per line. Use HOT for hot rolled steel (UC/UB/RHS/CHS/angles) and COLD for cold rolled (Z purlins/C rails/Metsec).
Example:
HOT,DWG01,Column,203x203x46UC,4200,4,46.1,1.821
HOT,DWG01,Beam,457x191x82UB,6000,8,82.1,2.166
COLD,DWG01,Purlin,Z200-19,6000,24,3.2

Keep section names short. Use 0 for unknown values.`;

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

    const raw = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
    if (!raw) return res.status(502).json({ error: 'No response from AI' });

    // Parse the CSV response into arrays
    const hotRolled = [];
    const coldRolled = [];

    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.startsWith('HOT,') || l.startsWith('COLD,'));

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      const type = parts[0]; // HOT or COLD

      if (type === 'HOT' && parts.length >= 7) {
        hotRolled.push({
          dwg: parts[1] || '',
          type: parts[2] || '',
          section: parts[3] || '',
          length: parseFloat(parts[4]) || 0,
          qty: parseFloat(parts[5]) || 0,
          kgm: parseFloat(parts[6]) || 0,
          m2m: parseFloat(parts[7]) || 0,
          notes: ''
        });
      } else if (type === 'COLD' && parts.length >= 6) {
        coldRolled.push({
          dwg: parts[1] || '',
          type: parts[2] || '',
          section: parts[3] || '',
          length: parseFloat(parts[4]) || 0,
          qty: parseFloat(parts[5]) || 0,
          kgm: parseFloat(parts[6]) || 0,
          notes: ''
        });
      }
    }

    if (hotRolled.length === 0 && coldRolled.length === 0) {
      return res.status(502).json({ error: 'No steel members found in drawing. Please check the PDF contains a structural drawing with member sizes.' });
    }

    return res.status(200).json({ hotRolled, coldRolled });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
