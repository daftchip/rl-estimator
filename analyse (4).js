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

  const prompt = `You are a highly experienced UK structural steel estimator with 30 years experience reading engineering drawings.

Carefully analyse this structural drawing PDF and extract ALL steel members. Follow these rules precisely:

READING MEASUREMENTS:
- Read all dimension strings carefully — they are usually in mm
- If a drawing has a scale bar, use it to verify sizes
- If dimensions are shown as e.g. "6000" that means 6000mm = 6.0m
- Calculate lengths from grid lines and dimension strings where member lengths aren't explicitly stated
- For repeated bays, multiply single bay length by number of bays
- Read member schedules, section lists, and general arrangement notes

IDENTIFYING MEMBERS:
- Hot rolled: UC columns, UB beams/rafters/eaves beams, RHS/SHS hollow sections, CHS circular hollow sections, angles, flats, plates, cleats
- Cold rolled: Z purlins, C side rails, eaves beams (Metsec/Kingspan/Steadmans), apex/ridge members
- Note grade if shown (S275, S355) — default S275 if not stated
- Note quantity carefully — count each member, check for symmetry (e.g. "2 frames @ 6m c/c" = multiple identical frames)

SECTION PROPERTIES (use these standard UK values for kgm and m2m):
UC: 152x152x23=23/0.6, 152x152x37=37/0.7, 203x203x46=46/0.8, 203x203x60=60/0.9, 254x254x73=73/1.0, 254x254x89=89/1.1, 305x305x97=97/1.2, 305x305x118=118/1.3
UB: 203x102x23=23/0.7, 254x102x25=25/0.8, 305x102x28=28/0.9, 356x127x33=33/1.0, 406x140x39=39/1.1, 457x152x52=52/1.3, 533x210x82=82/1.6, 610x229x101=101/1.9
RHS 200x100x8=38.8/0.6, RHS 250x150x8=49.9/0.8, CHS 168.3x5=20.1/0.5
Z purlins: Z140=2.0kg/m, Z170=2.5, Z200=3.2, Z242=4.1, Z262=4.5
C rails: C140=2.0, C170=2.5, C200=3.2

Return ONLY a CSV table, no headers, no explanation, nothing else:
HOT,dwg,type,section,length_mm,qty,kgm,m2m
COLD,dwg,type,section,length_mm,qty,kgm

One line per unique member type/length combination.
Example:
HOT,SK-01,Column,203x203x46UC,4500,4,46,0.8
HOT,SK-01,Rafter,457x152x52UB,7200,8,52,1.3
HOT,SK-01,Eaves Beam,254x102x25UB,6000,2,25,0.8
COLD,SK-01,Purlin,Z200-19,6000,24,3.2
COLD,SK-01,Side Rail,C170-15,6000,20,2.5

Use 0 for any value you cannot determine. Be thorough — include every member shown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
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
          notes: parts[8] || ''
        });
      } else if (type === 'COLD' && parts.length >= 6) {
        coldRolled.push({
          dwg: parts[1] || '',
          type: parts[2] || '',
          section: parts[3] || '',
          length: parseFloat(parts[4]) || 0,
          qty: parseFloat(parts[5]) || 0,
          kgm: parseFloat(parts[6]) || 0,
          notes: parts[7] || ''
        });
      }
    }

    if (hotRolled.length === 0 && coldRolled.length === 0) {
      return res.status(502).json({ error: 'No steel members found. Please check the PDF contains a structural drawing with member sizes shown.' });
    }

    return res.status(200).json({ hotRolled, coldRolled });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
