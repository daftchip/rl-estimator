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
  const typeStr = drawingType || 'ga';

  const typeDescriptions = {
    ga: 'General Arrangement drawing showing plan/elevation of the whole structure',
    framing: 'Framing plan showing beam and column grid layout',
    elevation: 'Elevation or cross-section through the structure',
    schedule: 'Member schedule or steel schedule listing all members',
    detail: 'Detail drawing showing connections or specific members'
  };
  const typeDesc = typeDescriptions[typeStr] || 'General Arrangement';

  const prompt = `You are a highly experienced UK structural steel estimator with 30 years experience reading engineering drawings.

DRAWING INFORMATION:
- Drawing type: ${typeDesc}
- Drawing scale: ${scaleStr}

SCALING INSTRUCTIONS:
${scale && scale !== 'auto' ? `
The drawing scale is ${scaleStr}. Use this to calculate member lengths:
- Measure the drawn length of each member on the page
- Multiply by the scale factor to get real length in mm
- e.g. at 1:100, a line 60mm long on paper = 6000mm real
- Always cross-check with any dimension strings shown — dimensions override scaled measurements
- Look for a scale bar on the drawing and use it to verify your scaling
` : `
Look for the scale stated on the drawing (usually in the title block or near the scale bar).
Common locations: bottom right corner, title block, near north point.
If you find a scale bar, use it to calibrate your measurements.
If dimensions are shown, always use those in preference to scaled measurements.
`}

READING INSTRUCTIONS:
1. Read ALL dimension strings carefully — they are in mm unless stated otherwise
2. Calculate lengths from grid lines × bay spacing where member lengths aren't labelled
3. For repeated bays: single bay length × number of bays = total run, but list each member individually
4. Read member schedules, section callouts, and general notes
5. Note steel grade if shown (S275, S355) — default S275 if not stated
6. Count members carefully — check for symmetry (e.g. portal frames at equal centres)
7. Eaves beams and apex members connect frames — their length = frame spacing × number of bays

SECTION PROPERTIES — use these exact UK values:
UC columns: 152x152x23=23kg/0.6m2, 203x203x46=46/0.8, 203x203x60=60/0.9, 254x254x73=73/1.0, 305x305x97=97/1.2
UB beams: 203x102x23=23/0.7, 254x102x25=25/0.8, 305x127x37=37/1.0, 356x171x45=45/1.1, 406x178x54=54/1.3, 457x191x67=67/1.5, 533x210x82=82/1.6, 610x229x101=101/1.9
RHS: 100x50x5=11.6/0.3, 150x100x6=22.7/0.5, 200x100x8=38.8/0.6, 250x150x8=49.9/0.8
CHS: 88.9x4=8.4/0.3, 114.3x5=13.5/0.4, 168.3x5=20.1/0.5
Z purlins: Z140=2.0, Z145=2.2, Z170=2.5, Z200=3.2, Z242=4.1, Z262=4.5
C rails: C140=2.0, C170=2.5, C200=3.2, C242=4.1

Return ONLY a CSV table, absolutely nothing else before or after:
HOT,dwg_no,member_type,section,length_mm,qty,kg_per_m,m2_per_m
COLD,dwg_no,member_type,section,length_mm,qty,kg_per_m

One row per unique member (same section + same length = one row, increase qty).
Examples:
HOT,SK-01,Column,203x203x46UC,4500,4,46,0.8
HOT,SK-01,Rafter,457x152x52UB,7200,8,52,1.3
HOT,SK-01,Eaves Beam,203x102x23UB,6000,2,23,0.7
COLD,SK-01,Purlin,Z200-19,6000,24,3.2
COLD,SK-01,Side Rail,C170-15,6000,20,2.5

Use 0 for values you cannot determine. Include every member shown on the drawing.`;

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
          dwg: parts[1] || '', type: parts[2] || '', section: parts[3] || '',
          length: parseFloat(parts[4]) || 0, qty: parseFloat(parts[5]) || 0,
          kgm: parseFloat(parts[6]) || 0, m2m: parseFloat(parts[7]) || 0, notes: ''
        });
      } else if (type === 'COLD' && parts.length >= 6) {
        coldRolled.push({
          dwg: parts[1] || '', type: parts[2] || '', section: parts[3] || '',
          length: parseFloat(parts[4]) || 0, qty: parseFloat(parts[5]) || 0,
          kgm: parseFloat(parts[6]) || 0, notes: ''
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
