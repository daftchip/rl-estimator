
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

  const approxMB = (pdfBase64.length * 0.75) / (1024 * 1024);
  if (approxMB > 15) {
    return res.status(400).json({
      error: `PDF is too large (approx ${Math.round(approxMB)}MB). Please split the drawing package and upload one sheet at a time. Maximum size is 15MB.`
    });
  }

  const scaleStr = scale && scale !== 'auto' ? scale : 'unknown — look for scale bar or text on drawing';

  const typeDescriptions = {
    ga: 'General Arrangement — shows overall layout. Members appear in plan AND elevation — count each UNIQUE member ONCE only using plan quantities.',
    framing: 'Framing Plan — each member is unique unless multiple bays shown.',
    elevation: 'Elevation/Section — note drawing ref. Members here may already be on GA.',
    schedule: 'MEMBER SCHEDULE — this is the MASTER. Extract exactly as listed, every row.',
    detail: 'Detail Drawing — extract connection plates, cleats, misc steel only.'
  };
  const typeDesc = typeDescriptions[drawingType||'ga'] || typeDescriptions.ga;

  const workTypeInstructions = {
    new: 'NEW BUILD — extract ALL steel members shown.',
    alteration: `ALTERATION/EXTENSION — NEW steel only.
INCLUDE: NEW, N, ADDITIONAL, TO BE PROVIDED, ADD., (N), solid/coloured lines
EXCLUDE: EXISTING, EX., EXIST., TO REMAIN, (E), dashed/greyed`,
    demolition: `DEMOLITION — members to be REMOVED only.
INCLUDE: REMOVE, DEMOLISH, DEMO, TO BE REMOVED, (R), crossed out
EXCLUDE: all steel to remain, all new steel`,
    all: 'Extract ALL steel. Label each in notes as NEW / EXISTING / REMOVE.'
  };
  const workInstr = workTypeInstructions[workType||'new'] || workTypeInstructions.new;

  const prompt = `You are a senior UK structural steel estimator working for Reynolds & Litchfield Ltd, constructional engineers established 1960. You have 30 years experience doing steel take-offs.

DRAWING TYPE: ${typeDesc}
DRAWING SCALE: ${scaleStr}
WORK TYPE: ${workInstr}

PORTAL FRAMES — HOW TO COUNT:
- Count FRAMES from plan view (column grid lines), NOT from elevation
- Label as PF1, PF2 etc in dwg field
- Each frame = 2 columns + 2 rafters + haunches + ridge
- Intermediate columns more common than corner — list separately by section

HAUNCHES:
- ALWAYS list haunches separately from rafters
- Same section as rafter but shorter length (typically 1000-1500mm)
- Qty = same as rafter qty (1 haunch per rafter end at eaves)

BRACING:
- CHS bracing lengths VARY per bay — measure each diagonal separately
- List per elevation grid: Elevation GL A, GL E, GL 1, GL 8 etc
- Vertical bracing and horizontal wind girder are separate items

GALVANISED ITEMS:
- Perimeter channels, ground beams, base angles often galvanised
- Mark in notes field: "galvanised"
- List separately from non-galvanised steelwork

SECTION SIZES:
- Read member schedule or key on drawing
- UB: e.g. 406*140*46, 533*210*82, 305*165*40
- UC: e.g. 203*203*46, 254*254*89
- PFC: e.g. PFC200*75, PFC230*90
- CHS: e.g. CHS139.7*4, CHS114.3*3.6
- RSA: e.g. RSA100*100*8

DIMENSION READING (PRIORITY):
1. Read printed dimension text on drawing
2. Read from member schedule or notes
3. Calculate from bay spacing x number of bays
4. Scale from drawing — LAST RESORT, confidence below 65

NEVER DOUBLE COUNT:
- Plan qty = correct for columns and frames
- Elevations show PROFILE — not additional members
- If member appears on plan AND elevation — count once from plan

COLD ROLLED — CALCULATE FROM DRAWING:
- Purlin section (e.g. 202Z18) and spacing (e.g. 1800 max centres)
- Rail section (e.g. 202C15) and spacing (e.g. 2000 max centres)
- Rail levels shown on elevation (e.g. +0.170, +2.170, +4.170)
- Eaves beam section (e.g. 230E25)

CALCULATE PURLINS:
- purlins per rafter = ROUNDUP(rafter_length / spacing) + 1
- Total runs = purlins per side x 2 x number of bays
- Each run length = bay spacing
- End bays may differ — list separately

CALCULATE CLADDING RAILS:
- Count rail levels from elevation
- Total runs per elevation = rail levels x number of bays
- List SEPARATELY per elevation grid
- Show working in flag field

EAVES BEAMS: 1 per bay along each eave, length = bay spacing

OUTPUT FORMAT — Return ONLY CSV, no headers, no markdown:
HOT,dwg_ref,member_type,section,length_mm,qty,kg_per_m,m2_per_m,confidence,flag
COLD,dwg_ref,member_type,section,length_mm,qty,kg_per_m,confidence,flag

confidence: 95+=clearly stated, 80-94=mostly clear, 65-79=some inference, below 65=scaled/guessed
flag: reason if below 80, working for cold rolled, "galvanised" if galv, POSSIBLE DUPLICATE if repeated

EXAMPLES:
HOT,Plan PF1-7,Column,533*210*82UB,8310,12,82.2,1.8495,95,intermediate cols
HOT,Plan PF1-7,Rafter,406*140*46UB,12080,12,46,1.3386,92,6 bays x2 sides
HOT,Plan PF1-7,Haunch,406*140*46UB,1200,12,46,1.3386,92,1 per rafter end
HOT,Elev GL A,Bracing,CHS139.7*4,6905,2,13.4,0.439,88,diagonal varies per bay
HOT,Plan,Galv Perimeter,PFC200*75,6000,5,23.4,0.6786,90,galvanised
COLD,Cross section,Purlin,202Z18,6000,90,4.88,85,rafter 12080/1800crs=7/side x2 x7 bays
COLD,Elev GL E,Cladding Rail,202C15,6000,19,4.09,88,5 rail levels x 7 bays
COLD,Elev GL E,Eaves Beam,230E25,6000,10,8.47,90,1 per bay

Use 0 for unknown values. Include every member including small items.`;

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
          confidence: parseInt(parts[8]) || 80,
          flag: parts.slice(9).join(',').trim() || '', notes: ''
        });
      } else if (type === 'COLD' && parts.length >= 6) {
        coldRolled.push({
          dwg: parts[1] || '', type: parts[2] || '', section: parts[3] || '',
          length: parseFloat(parts[4]) || 0, qty: parseFloat(parts[5]) || 0,
          kgm: parseFloat(parts[6]) || 0,
          confidence: parseInt(parts[7]) || 80,
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
