const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Agent } = require('undici');

// Node's native fetch() (built on undici) defaults headersTimeout/bodyTimeout
// to 300s each, which cuts off long-running Anthropic calls well before our
// Vercel maxDuration (800s) is reached. Use a dedicated dispatcher with much
// longer timeouts for this specific call.
const longTimeoutDispatcher = new Agent({
  headersTimeout: 780000, // 780s, just under our 800s maxDuration
  bodyTimeout: 780000,
  keepAliveTimeout: 780000
});

async function analyseOnePage(pageBase64, prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 48000,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pageBase64 } },
          { type: 'text', text: prompt }
        ]
      }]
    }),
    dispatcher: longTimeoutDispatcher
  });

  const respText = await response.text();
  if (!response.ok) {
    let errMsg = 'API error ' + response.status;
    try { const e = JSON.parse(respText); errMsg = e.error?.message || errMsg; } catch(_) {}
    throw new Error(errMsg);
  }

  const data = JSON.parse(respText);
  if (data.type === 'error') throw new Error(data.error?.message || 'AI error');
  const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
  if (!text) {
    const blockTypes = (data.content || []).map(c => c.type).join(',') || 'none';
    throw new Error(`AI returned no text (stop_reason=${data.stop_reason || '?'}, content_blocks=[${blockTypes}])`);
  }
  return text;
}

function splitPdfPages(pdfBuffer) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rl-pdf-'));
  const inputPath = path.join(tmpDir, 'input.pdf');
  fs.writeFileSync(inputPath, pdfBuffer);

  // Use pdftk or qpdf if available, otherwise return the whole PDF as one page
  try {
    // Try qpdf first
    execSync(`qpdf --split-pages ${inputPath} ${path.join(tmpDir, 'page-%d.pdf')} 2>/dev/null`);
    const pages = fs.readdirSync(tmpDir)
      .filter(f => f.startsWith('page-') && f.endsWith('.pdf'))
      .sort()
      .map(f => fs.readFileSync(path.join(tmpDir, f)).toString('base64'));
    fs.rmSync(tmpDir, { recursive: true, force: true });
    return pages;
  } catch(e) {
    // qpdf not available — return whole PDF as single item
    fs.rmSync(tmpDir, { recursive: true, force: true });
    return [pdfBuffer.toString('base64')];
  }
}

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
CRITICAL RULE 1B — BASE PLATES, HAUNCHES, POSTS, AND BUILT-UP MEMBERS
═══════════════════════════════════════════════
A proper take-off includes these as their OWN line items, in addition to the main members:

- BASE PLATES: every column foot typically has a welded base plate (a flat plate, e.g. PLT20x500). A base plate detail normally gives you THREE separate numbers — thickness, width, and length — do not confuse them. Output member_type "welded", section as PLT{thickness}x{WIDTH} using the plate's WIDTH (the shorter in-plan dimension, e.g. PLT20x500), and length_mm as the plate's LENGTH (the other in-plan dimension, e.g. 1040 — this is very often a different, larger number than the width). NEVER copy the length value into the section field, and never put the same number in both the section and length_mm fields unless the plate really is square. qty = matches the number of columns it serves. Look for base plate details/schedules, or a callout near the column base.
- HAUNCHES: portal frame rafter/column haunches (the deepened triangular/tapered section at the eaves or apex knee joint) are their own line item, separate from the straight rafter or column they reinforce. Give them their own mark/reference if labelled (e.g. a haunch mark number), member_type "haunch", and the section of the plate/cutting used to form them if stated.
- POSTS: a vertical member that is not a primary frame column (e.g. parapet post, corner post, gable post, infill post) should use member_type "post", not "column" or "beam".
- BUILT-UP / COMPOSITE MEMBERS: when a hollow section or beam is shown welded together with a flat plate to form one built-up member (e.g. an RHS with a welded flange plate), output them as TWO separate rows — one for the main section (member_type "beam" or similar) and one for the plate (member_type "welded") — both sharing the same length and quantity, exactly as a fabricator would price them separately.

Do not skip these just because they are smaller or less prominent than the main frame members — on a real take-off they are counted every time.

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
Count rafters from the PLAN view. List every group as a separate row.
Rafters at different lengths = separate rows.

═══════════════════════════════════════════════
CRITICAL RULE 4 — GROUP BY SECTION AND LENGTH, BUT NEVER UNDER-COUNT A REPEATED CALLOUT
═══════════════════════════════════════════════
Same section + same length, within ONE single location/area = ONE row, qty = total count for that area.
Same section + different length = SEPARATE rows.

A drawing set very often repeats the SAME note in several different places — e.g. "Parapet Post 152x152x37 x7" labelled separately on Elevation 1-A, Elevation 1-C, Elevation 1-D, Section 6, Section 7 and Section 14, or a bracing flat labelled on every elevation. These are NOT the same steel counted twice — each labelled occurrence is a DIFFERENT physical location on the building and its quantity must be ADDED to the running total, not treated as a duplicate of a note you already logged elsewhere. If you see what looks like an identical section+length+qty combination appearing on a different drawing/elevation/section view, or against a different grid reference/dwg_ref, SUM it in — only collapse to one row when it is genuinely the same single callout on the same area read twice. When in doubt, keep them as separate rows (one per area) with the matching dwg_ref/area noted — it is far better to slightly over-list than to silently drop a real repeated member.

═══════════════════════════════════════════════
CRITICAL RULE 5 — HOW TO DETERMINE LENGTH (in priority order)
═══════════════════════════════════════════════
1. BEST: An explicit dimension string, leader line or text label giving that member's exact length. Use this whenever it exists. → confidence 95+
2. NEXT: Calculate from grid spacing — the distance between two labelled gridlines (e.g. GL A to GL B) the member spans. → confidence 80-94, note "grid calc GL X-Y" in flag
3. LAST RESORT: Measure against the stated drawing scale using the page geometry. → confidence below 80, note "scaled off drawing" in flag
Never invent a length. If truly unreadable, output length 0 with confidence below 50 and flag "length unreadable — needs site check or RFI".

═══════════════════════════════════════════════
CRITICAL RULE 6 — WORK THE GRID METHODICALLY, AREA BY AREA
═══════════════════════════════════════════════
Structural drawings are set out on a numbered/lettered grid (e.g. 1,2,3... one way, A,B,C... the other). Use grid intersections to pin down each member's location — put this in dwg_ref (e.g. "GL A-B / 1-2"). Go bay by bay, grid-square by grid-square, in a fixed order (e.g. left-to-right, top-to-bottom) rather than scanning loosely — this is what prevents double-counting a member twice or missing one entirely, and is standard practice for a proper take-off.

If the sheet (or set of sheets) shows MULTIPLE separate elevations or sections — e.g. "Elevation 1-A", "Elevation 1-C", "Elevation 1-D", "Elevation 2-A", "Elevation 2-B", "Elevation 2-D", "Elevation 3-C", "Section 6", "Section 7", "Section 14" — treat EACH one as its own complete area to take off in full, in turn. Do not assume that because you've already logged a member type on one elevation, the same member type on a different elevation is already accounted for — even visually similar elevations usually have genuinely separate steel (different bracing runs, different posts, different beam lengths) that must each be read and counted on their own merits. Keep a running mental list of which named areas/elevations/sections you have fully worked through, and do not finish until every one of them has been covered.

═══════════════════════════════════════════════
CRITICAL RULE 7 — SCHEDULES ARE THE SOURCE OF TRUTH FOR SECTION SIZE
═══════════════════════════════════════════════
If any schedule or table on the sheet lists member sizes, treat it as definitive for the SECTION field. But still confirm each scheduled item actually appears on the drawing, and count its true quantity from the drawing/plan view — only take quantity directly from the schedule if the schedule explicitly states a quantity for that mark.

═══════════════════════════════════════════════
CRITICAL RULE 8 — SELF-CHECK BEFORE FINISHING
═══════════════════════════════════════════════
Before you output your final answer:
1. Re-scan the whole drawing once more, bay by bay, specifically looking for anything easy to miss: eaves beams, gable posts, kickers, cranked columns, wind bracing, sag rods, mezzanine or plant-support steel, flat plate (FLT) diagonal bracing, and members right at the edges/corners of the sheet.
2. Specifically re-check every named elevation/section view (see RULE 6) one more time for: (a) flat bracing plates (FLT...) — these are thin and easy to skim past, and (b) any post, bracing or beam callout that also appears on another elevation — confirm you have summed ALL of its occurrences, not just the first one you found.
3. Check whether the same section size is being used for more than one ROLE on this drawing (e.g. the same UC or PFC size used both as a column/post at base plates AND as a beam/rail elsewhere). These are different members in different locations and must BOTH appear as separate rows — do not let a column instance of a section "absorb" a beam instance of the same section, or vice versa.
4. Sanity-check your total row count against the building's apparent size — a small single-bay unit is typically 15-40 hot rolled line items; a larger multi-bay building is often 60-150+, and a building with several named elevations/sections (see RULE 6) is usually at the higher end of that range or beyond. If your count seems low for what's shown, look again before answering.
5. Do not stop early. Every steel member on the sheet must appear in your output, however small, however many times its callout is repeated across different areas.

═══════════════════════════════════════════════
SECTION SIZES — READ CAREFULLY
═══════════════════════════════════════════════
- UB beams: e.g. 178x102x19UB, 254x146x31UB, 305x165x40UB
- UC columns: e.g. 152x152x23UC, 254x146x31UC
- PFC channels: e.g. PFC200x75, PFC230x90
- CHS: e.g. CHS76.1x3.2, CHS114.3x3.6
- RSA angles: e.g. RSA100x100x8
- Flat plate bracing: e.g. FLT10x100
- Labels like "178x102UB 19" or "178/102/19" → output as 178x102x19UB

═══════════════════════════════════════════════
STEP 1 — WORKING NOTES (REQUIRED, BEFORE YOU WRITE ANY CSV)
═══════════════════════════════════════════════
A drawing with multiple elevations/sections is too easy to lose track of if you go straight to the final answer. Before writing a single CSV line, write out your working notes in plain text, structured like this:

AREAS FOUND: <list the name of every single named elevation/section/plan view on the sheet, e.g. Elevation 1-A, Elevation 1-C, Elevation 1-D, Elevation 2-A, Elevation 2-B, Elevation 2-D, Elevation 3-C, Section 6, Section 7, Section 14, Roof Plan, Column Layout GL Grid, etc.>

Then, for EACH area listed above, in turn, write a short checklist line per member you can see in that area, e.g.:
Elevation 1-A: Parapet Post 152x152x37 x7, Bracing CHS114.3x6.3 x4, FLT10x100 bracing x2
Elevation 1-C: Parapet Post 152x152x37 x7, ...
Section 6: UC203x203x46 beam x2 (NOTE: this is a BEAM here, separate from the UC203x203x46 COLUMNS already logged in Column Layout GL Grid — do not merge them)
...and so on for every area.

This working-notes section is your scratch pad — write it in plain text, not CSV. It is what stops you silently losing a repeated callout or merging a beam into a column of the same size. Do not skip it or shortcut it.

═══════════════════════════════════════════════
STEP 2 — FINAL CSV OUTPUT
═══════════════════════════════════════════════
After your working notes, output the final take-off as CSV lines. Every single member you listed in your working notes above MUST appear as a CSV row here — the working notes and the CSV must match up one-for-one. Any text that is not a working-notes line or a CSV line (headings, commentary) is fine to include but will be ignored by the parser — only lines starting exactly with "HOT," or "COLD," are read as data.

HOT,dwg_ref,member_type,section,length_mm,qty,kg_per_m,m2_per_m,confidence,flag
COLD,dwg_ref,member_type,section,length_mm,qty,kg_per_m,confidence,flag

confidence: 95+ = length AND section both explicitly labelled (drawing or schedule); 80-94 = section explicit, length from grid spacing; 65-79 = section or length partly inferred from notes or typical-bay assumptions; below 65 = scaled off the page with a ruler, or genuinely unclear and needs a human to check.
flag: when confidence is below 80, always state HOW you arrived at the value (e.g. "grid calc GL 2-3", "scaled off drawing", "section illegible, taken from schedule"). Also flag GALVANISED where noted.

EXAMPLES:
HOT,First Floor Plan,Column,254x146x31UB,5690,8,31.1,1.057,95,grid cols
HOT,Roof Plan,Rafter,178x102x19UB,3114,20,19,0.735,95,typical bays
HOT,Elevation GL A,Bracing,CHS76.1x3.2,5204,2,5.75,0.239,88,diagonal
HOT,Elevation GL K,Flat Bracing,FLT10x100,4225,2,7.85,0.220,90,flat plate
HOT,BP1,Welded,PLT20x500,1040,14,78.5,1.080,90,base plate to column
HOT,194.18,Haunch,610x305x179,4800,7,179,2.417,85,eaves haunch rafter/column
HOT,Parapet,Post,152x152x37,2440,7,37,0.914,92,parapet post
COLD,Roof Plan,Purlin,202Z18,6000,90,4.88,85,1800crs calc
COLD,Elevation,Side Rail,202C15,6000,19,4.09,88,5 levels x 7 bays

Use 0 for unknown values. Include EVERY steel member from your working notes as a CSV row.`;

  try {
    // Split PDF into pages and process each separately
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const pages = splitPdfPages(pdfBuffer);

    // Process all pages in parallel (max 4 at a time)
    const allLines = [];
    const pageErrors = [];
    const rawResponses = [];
    const batchSize = 4;
    for (let i = 0; i < pages.length; i += batchSize) {
      const batch = pages.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(p =>
        analyseOnePage(p, prompt).catch(e => { pageErrors.push(e.message); return ''; })
      ));
      results.forEach(r => { rawResponses.push(r); allLines.push(...r.split('\n')); });
    }

    const hotRolled = [];
    const coldRolled = [];
    const lines = allLines.map(l => l.trim()).filter(l => l.startsWith('HOT,') || l.startsWith('COLD,'));

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
      if (pageErrors.length > 0) {
        return res.status(502).json({ error: 'AI analysis failed: ' + pageErrors[0] });
      }
      const sample = rawResponses.filter(r => r).join(' | ').slice(0, 600);
      return res.status(502).json({ error: 'No steel members found. AI said: ' + (sample || '(AI returned an empty response)') });
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
