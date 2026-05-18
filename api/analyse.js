module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pdfBase64, scale, drawingType, workType } = req.body || {};
  if (!pdfBase64) return res.status(400).json({ error: 'No PDF data provided' });
  if (!pdfBase64.startsWith('JVBERi'))
    return res.status(400).json({ error: 'Invalid file - please upload a PDF drawing' });

  const scaleStr = scale && scale !== 'auto' ? scale : 'unknown - look for scale bar or text on drawing';

  const typeDescriptions = {
    ga: 'General Arrangement - shows overall layout of ALL levels. Extract members from EVERY floor plan and roof plan shown.',
    framing: 'Framing Plan - extract every member shown. Each bay is a separate member unless noted as typical.',
    elevation: 'Elevation/Section - extract all members visible. Columns, beams, bracing and rafters are all separate line items.',
    schedule: 'MEMBER SCHEDULE - this is the MASTER source. Extract exactly as listed, every single row without exception.',
    detail: 'Detail Drawing - extract connection plates, cleats, stiffeners and misc steel only.'
  };
  const typeDesc = typeDescriptions[drawingType||'ga'] || typeDescriptions.ga;

  const workTypeInstructions = {
    new: 'NEW BUILD - extract ALL steel members shown on the drawing.',
    alteration: 'ALTERATION/EXTENSION - NEW steel only. INCLUDE: NEW, N, ADDITIONAL, TO BE PROVIDED, ADD., (N), solid/coloured lines. EXCLUDE: EXISTING, EX., EXIST., TO REMAIN, (E), dashed/greyed lines.',
    demolition: 'DEMOLITION - members to be REMOVED only. INCLUDE: REMOVE, DEMOLISH, DEMO, TO BE REMOVED, (R), crossed out members. EXCLUDE: all steel to remain and all new steel.',
    all: 'Extract ALL steel. Label each in notes as NEW / EXISTING / REMOVE.'
  };
  const workInstr = workTypeInstructions[workType||'new'] || workTypeInstructions.new;

  const prompt = `You are a senior UK structural steel estimator with 30 years experience doing steel take-offs for Reynolds & Litchfield Ltd, constructional engineers.

DRAWING TYPE: ${typeDesc}
DRAWING SCALE: ${scaleStr}
WORK TYPE: ${workInstr}

═══════════════════════════════════════════════
CRITICAL RULE 1 — STEEL ONLY, NO CONCRETE
═══════════════════════════════════════════════
ONLY extract structural STEEL members:
✓ UB beams, UC columns, RHS, CHS, SHS, PFC channels, RSA angles, flat plates, hollow sections
✗ DO NOT extract: pad bases, pile caps, ground beams, RC slabs, concrete foundations, mass concrete, reinforcement bars, mesh, holding down bolts, anchor bolts
If you see "Pad Base", "RC slab", "Mass Concrete", "Foundation" — IGNORE IT COMPLETELY.

═══════════════════════════════════════════════
CRITICAL RULE 2 — COUNT EVERY MEMBER ON EVERY LEVEL
═══════════════════════════════════════════════
Multi-storey buildings have steel on EACH floor — count them ALL separately:
- Ground floor beams → separate rows
- First floor beams → separate rows
- Second floor beams → separate rows
- Roof beams / rafters → separate rows
- Columns full height OR per-storey as shown

DO NOT skip any floor level. DO NOT assume members on one floor are the same as another.

═══════════════════════════════════════════════
CRITICAL RULE 3 — RAFTERS AND BEAMS ARE DIFFERENT ROWS
═══════════════════════════════════════════════
If rafters appear in BOTH plan and elevation, count from the PLAN (most accurate qty).
But DO list them — do not omit them.
Rafters at different spacings or lengths = separate rows.

═══════════════════════════════════════════════
CRITICAL RULE 4 — IDENTICAL LENGTHS ARE STILL SEPARATE ROWS
═══════════════════════════════════════════════
If the same section appears at 10 different locations with the same length, list them as ONE row with qty=10.
But if the same section appears at TWO DIFFERENT LENGTHS, that is TWO ROWS.

═══════════════════════════════════════════════
SECTION SIZES — READ CAREFULLY
═══════════════════════════════════════════════
- UB beams: e.g. 178x102x19UB, 254x146x31UB, 305x165x40UB, 406x140x46UB
- UC columns: e.g. 152x152x23UC, 254x146x31UC, 203x203x46UC
- PFC channels: e.g. PFC200x75, PFC230x90
- CHS: e.g. CHS76.1x3.2, CHS114.3x3.6, CHS139.7x4.0
- RSA angles: e.g. RSA100x100x8, RSA75x75x6
- Flat plate bracing: e.g. FLT10x100, 10x100 flat
- Note: section labels on drawings often written as e.g. "178x102UB 19" or "178/102/19" — always output as 178x102x19UB

═══════════════════════════════════════════════
DIMENSIONS
═══════════════════════════════════════════════
Priority order:
1. Printed dimension text on drawing (most accurate)
2. Member schedule or notes table on drawing
3. Calculate: bay spacing x number of bays
4. Scale from drawing (last resort — set confidence below 65)

═══════════════════════════════════════════════
BRACING
═══════════════════════════════════════════════
- List per elevation grid: e.g. "Elevation GL A", "Elevation GL 1"
- CHS diagonal bracing: measure each diagonal length separately
- Flat plate bracing: note size e.g. FLT10x100
- Horizontal wind girder: separate row from vertical bracing

═══════════════════════════════════════════════
HAUNCHES
═══════════════════════════════════════════════
- List haunches as separate rows from rafters
- Same section as rafter, shorter length (typically 1000-1500mm)
- Qty = same as number of rafter ends at eaves

═══════════════════════════════════════════════
COLD ROLLED MEMBERS
═══════════════════════════════════════════════
- Purlins: section (e.g. 202Z18), spacing from drawing notes
- Side rails: section (e.g. 202C15), levels from elevation
- Eaves beams: e.g. 230E25, 1 per bay along each eave
- Calculate: purlins per rafter = ROUNDUP(rafter_length / spacing) + 1

═══════════════════════════════════════════════
OUTPUT FORMAT — Return ONLY these CSV lines, nothing else
═══════════════════════════════════════════════
HOT,dwg_ref,member_type,section,length_mm,qty,kg_per_m,m2_per_m,confidence,flag
COLD,dwg_ref,member_type,section,length_mm,qty,kg_per_m,confidence,flag

confidence: 95+=clearly stated on drawing, 80-94=mostly clear, 65-79=some inference needed, below 65=scaled or guessed
flag: brief reason if confidence below 80, or working shown for cold rolled calc, or GALVANISED if galvanised

EXAMPLES:
HOT,First Floor Plan,Column,254x146x31UB,5690,8,31.1,1.057,95,grid A-K cols
HOT,First Floor Plan,Beam,178x102x19UB,4128,20,19,0.735,95,secondary beams
HOT,Roof Plan,Rafter,178x102x19UB,3114,20,19,0.735,95,typical rafter bays
HOT,Elevation GL A,Bracing,CHS76.1x3.2,5204,2,5.75,0.239,88,diagonal measured
HOT,Elevation GL K,Flat Bracing,FLT10x100,4225,2,7.85,0.220,90,flat plate bracing
COLD,Roof Plan,Purlin,202Z18,6000,90,4.88,85,rafter 12080/1800crs=7/side x2 x7 bays
COLD,Elevation,Side Rail,202C15,6000,19,4.09,88,5 rail levels x 7 bays

Use 0 for any unknown values. Include EVERY steel member. Do not add any text before or after the CSV lines.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
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
        r.flag = (r.flag ? r.flag + ' - ' : '') + 'POSSIBLE DUPLICATE of ' + seen[key];
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
