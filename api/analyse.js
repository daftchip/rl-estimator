const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
      max_tokens: 24000,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pageBase64 } },
          { type: 'text', text: prompt }
        ]
      }]
    })
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
CRITICAL RULE 4 — GROUP BY SECTION AND LENGTH
═══════════════════════════════════════════════
Same section + same length = ONE row, qty = total count.
Same section + different length = SEPARATE rows.

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
OUTPUT FORMAT — CSV LINES ONLY, NO OTHER TEXT
═══════════════════════════════════════════════
HOT,dwg_ref,member_type,section,length_mm,qty,kg_per_m,m2_per_m,confidence,flag
COLD,dwg_ref,member_type,section,length_mm,qty,kg_per_m,confidence,flag

confidence: 95+=clearly stated, 80-94=mostly clear, 65-79=inferred, below 65=scaled/guessed
flag: reason if below 80, GALVANISED if galvanised

EXAMPLES:
HOT,First Floor Plan,Column,254x146x31UB,5690,8,31.1,1.057,95,grid cols
HOT,Roof Plan,Rafter,178x102x19UB,3114,20,19,0.735,95,typical bays
HOT,Elevation GL A,Bracing,CHS76.1x3.2,5204,2,5.75,0.239,88,diagonal
HOT,Elevation GL K,Flat Bracing,FLT10x100,4225,2,7.85,0.220,90,flat plate
COLD,Roof Plan,Purlin,202Z18,6000,90,4.88,85,1800crs calc
COLD,Elevation,Side Rail,202C15,6000,19,4.09,88,5 levels x 7 bays

Use 0 for unknown values. Include EVERY steel member. No text outside CSV lines.`;

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
