export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pdfBase64, scale, drawingType, workType } = req.body || {};
  if (!pdfBase64) return res.status(400).json({ error: 'No PDF data provided' });
  if (!pdfBase64.startsWith('JVBERi'))
    return res.status(400).json({ error: 'Invalid file — please upload a PDF drawing' });

  const scaleStr = scale && scale !== 'auto' ? scale : 'unknown — look for scale bar or text on drawing';

  const typeDescriptions = {
    ga: 'General Arrangement — shows overall layout. Members may appear in plan AND elevation — count each UNIQUE member ONCE only.',
    framing: 'Framing Plan — each member shown is unique unless drawing shows multiple bays/frames.',
    elevation: 'Elevation/Section — members here may already appear on GA — note the drawing reference.',
    schedule: 'MEMBER SCHEDULE — this is the MASTER document. Extract exactly as listed. Do NOT skip any rows.',
    detail: 'Detail Drawing — extract plates, cleats and misc steel only. Do NOT re-extract main members.'
  };
  const typeDesc = typeDescriptions[drawingType||'ga'] || typeDescriptions.ga;

  const workTypeInstructions = {
    new: `NEW BUILD — extract ALL steel members.`,
    alteration: `ALTERATION/EXTENSION — NEW steel only.
- INCLUDE: NEW, N, ADDITIONAL, TO BE PROVIDED, ADD., (N)
- EXCLUDE: EXISTING, EX., EXIST., TO REMAIN, (E), dashed/greyed members`,
    demolition: `DEMOLITION — members to be REMOVED only.
- INCLUDE: REMOVE, DEMOLISH, DEMO, TO BE REMOVED, (R), crossed-out members
- EXCLUDE: all steel to remain, all new steel`,
    all: `Extract ALL steel. Label notes field: NEW / EXISTING / REMOVE for each member.`
  };
  const workInstr = workTypeInstructions[workType||'new'] || workTypeInstructions.new;

  const prompt = `You are a senior UK structural steel estimator with 30 years experience doing steel take-offs from engineering drawings.

DRAWING TYPE: ${typeDesc}
DRAWING SCALE: ${scaleStr}
WORK TYPE: ${workInstr}

HOT ROLLED RULES:

1. NEVER DOUBLE-COUNT
   - Member shown in plan AND elevation = count ONCE (use plan qty)
   - If a member schedule exists on drawing, use IT as master
   - "4No." or "x4" next to a member = that IS the quantity
   - Portal frame: use plan quantity for columns not elevation

2. DIMENSIONS — PRIORITY ORDER:
   a) Read printed dimension text on drawing (e.g. "6000" or "6.0m")
   b) Read from member schedule or table
   c) Calculate: bays x bay width (e.g. "5 bays @ 6000mm")
   d) Scale from drawing — LAST RESORT ONLY, set confidence below 65

3. SECTION SIZES:
   - Read exact designation: 203x203x46UC, 457x191x82UB, 200x100x8RHS
   - If only depth shown (e.g. "203UC") flag it
   - Note grid ref in dwg field (e.g. "Grid A/1-2")

COLD ROLLED — CRITICAL:

Cold rolled purlins and rails are often shown as lines on a roof/wall plan with NO individual labels.
You MUST calculate quantities using the information on the drawing.

STEP 1 — FIND THESE VALUES:
- Section size (e.g. 172Z19, 202Z25, 142C18)
- Purlin spacing (e.g. "@ 1800 crs", "1800 max")
- Rafter length (from elevation dimension)
- Number of bays (count on plan)
- Eaves height (for side rails)
- Bay spacing (column centres)

STEP 2 — CALCULATE:
ROOF PURLINS:
- Purlins per rafter = ROUNDUP(rafter length / spacing) + 1
- If symmetrical both sides: x2
- Total runs = purlins per side x2 x number of bays
- Each run length = bay spacing

SIDE RAILS:
- Rails per column = ROUNDUP(eaves height / spacing) + 1
- Total runs = rails per column x2 sides x number of bays
- Each run length = bay spacing

EAVES BEAMS:
- 1 per bay per eave line
- Length = bay spacing

STEP 3 — SHOW WORKING in flag field:
Example: "7200 rafter / 1800 crs = 5/side x2 x6 bays = 60 runs @ 6000mm"

STEP 4 — ONE ROW PER SECTION SIZE grouping all same sections together.

OUTPUT FORMAT — Return ONLY CSV, no headers, no explanation:
HOT,dwg_ref,member_type,section,length_mm,qty,kg_per_m,m2_per_m,confidence,flag
COLD,dwg_ref,member_type,section,length_mm,qty,kg_per_m,confidence,flag

EXAMPLES:
HOT,GA-01 Grid1-2,Column,203x203x46UC,4500,4,46.1,0.808,95,
HOT,GA-01,Rafter,457x152x52UB,7200,12,52.3,1.301,88,6 bays x2 sides
HOT,GA-01,Bracing,100x100x8RHS,3200,6,22.7,0.600,72,length scaled
COLD,GA-01,Purlin,172Z19,6000,60,3.49,88,7200mm rafter/1800crs=5/side x2 x6 bays=60
COLD,GA-01,Side Rail,142C18,6000,42,2.84,85,4500mm eaves/1500crs=4/side x2 x6 bays=42
COLD,GA-01,Eaves Beam,202Z25,6000,12,5.40,90,1 per bay x2 eaves x6 bays=12

Use 0 for any value you cannot determine. Include EVERY qualifying member.`;

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
          kgm: parseFloat(parts[6]) || 0, m2m: parseFloat(parts[7]) || 0,
          confidence: parseInt(parts[8]) || 80, flag: parts.slice(9).join(',').trim() || '', notes: ''
        });
      } else if (type === 'COLD' && parts.length >= 6) {
        coldRolled.push({
          dwg: parts[1] || '', type: parts[2] || '', section: parts[3] || '',
          length: parseFloat(parts[4]) || 0, qty: parseFloat(parts[5]) || 0,
          kgm: parseFloat(parts[6]) || 0, confidence: parseInt(parts[7]) || 80,
          flag: parts.slice(8).join(',').trim() || '', notes: ''
        });
      }
    }

    if (hotRolled.length === 0 && coldRolled.length === 0) {
      return res.status(502).json({ error: 'No steel members found. Check the PDF contains a structural drawing with member sizes shown.' });
    }

    const seen = {};
    hotRolled.forEach(r => {
      const key = `${r.section}|${r.length}|${r.qty}`;
      if (seen[key]) {
        r.flag = (r.flag ? r.flag + ' · ' : '') + 'POSSIBLE DUPLICATE of ' + seen[key];
        r.confidence = Math.min(r.confidence, 60);
      } else {
        seen[key] = r.dwg || 'earlier row';
      }
    });

    return res.status(200).json({ hotRolled, coldRolled });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
