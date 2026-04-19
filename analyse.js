export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pdfBase64, scale, drawingType } = req.body || {};
  if (!pdfBase64) return res.status(400).json({ error: 'No PDF data provided' });
  if (!pdfBase64.startsWith('JVBERi'))
    return res.status(400).json({ error: 'Invalid file — please upload a PDF drawing' });

  const scaleStr = scale && scale !== 'auto' ? scale : 'unknown — look for scale bar or text on drawing';
  const typeDescriptions = {
    ga: 'General Arrangement drawing showing plan/elevation of the whole structure',
    framing: 'Framing plan showing beam and column grid layout',
    elevation: 'Elevation or cross-section through the structure',
    schedule: 'Member schedule or steel schedule listing all members',
    detail: 'Detail drawing showing connections or specific members'
  };
  const typeDesc = typeDescriptions[drawingType||'ga'] || 'General Arrangement';

  const prompt = `You are a highly experienced UK structural steel estimator with 30 years experience reading engineering drawings.

DRAWING INFORMATION:
- Drawing type: ${typeDesc}
- Drawing scale: ${scaleStr}

Extract ALL steel members. For each member, assign a confidence score (0-100) based on how certain you are:
- 90-100: Section size, length and quantity clearly stated on drawing
- 70-89: Most info clear but some inferred (e.g. length scaled, not dimensioned)
- 50-69: Section identified but length or qty uncertain
- Below 50: Guessed — flag for human review

Return ONLY a CSV table, no headers, no explanation:
HOT,dwg,type,section,length_mm,qty,kgm,m2m,confidence,flag
COLD,dwg,type,section,length_mm,qty,kgm,confidence,flag

confidence = 0-100 integer
flag = reason for low confidence if under 70, else blank

Examples:
HOT,SK-01,Column,203x203x46UC,4500,4,46,0.8,95,
HOT,SK-01,Rafter,457x152x52UB,7200,8,52,1.3,72,length scaled not dimensioned
HOT,SK-01,Bracing,100x100x8RHS,3200,6,22.7,0.6,45,section size unclear on drawing
COLD,SK-01,Purlin,Z200-19,6000,24,3.2,88,
COLD,SK-01,Side Rail,C170-15,5500,20,2.5,55,length estimated from bay spacing

Use 0 for any value you cannot determine. Include every member shown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
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

    const hotRolled = [];
    const coldRolled = [];
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.startsWith('HOT,') || l.startsWith('COLD,'));

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      const type = parts[0];
      if (type === 'HOT' && parts.length >= 7) {
        hotRolled.push({
          dwg: parts[1] || '',
          type: parts[2] || '',
          section: parts[3] || '',
          length: parseFloat(parts[4]) || 0,
          qty: parseFloat(parts[5]) || 0,
          kgm: parseFloat(parts[6]) || 0,
          m2m: parseFloat(parts[7]) || 0,
          confidence: parseInt(parts[8]) || 80,
          flag: parts.slice(9).join(',').trim() || '',
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
          confidence: parseInt(parts[7]) || 80,
          flag: parts.slice(8).join(',').trim() || '',
          notes: ''
        });
      }
    }

    if (hotRolled.length === 0 && coldRolled.length === 0) {
      return res.status(502).json({ error: 'No steel members found. Check the PDF is a structural drawing with member sizes shown.' });
    }

    return res.status(200).json({ hotRolled, coldRolled });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
