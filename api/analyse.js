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
ga: 'General Arrangement - shows overall layout. Members appear in plan AND elevation - count each UNIQUE member ONCE only using plan quantities.',
framing: 'Framing Plan - each member is unique unless multiple bays shown.',
elevation: 'Elevation/Section - note drawing ref. Members here may already be on GA.',
schedule: 'MEMBER SCHEDULE - this is the MASTER. Extract exactly as listed, every row.',
detail: 'Detail Drawing - extract connection plates, cleats, misc steel only.'
};
const typeDesc = typeDescriptions[drawingType||'ga'] || typeDescriptions.ga;
const workTypeInstructions = {
new: 'NEW BUILD - extract ALL steel members shown.',
alteration: 'ALTERATION/EXTENSION - NEW steel only. INCLUDE: NEW, N, ADDITIONAL, TO BE PROVIDED, ADD., (N), solid/coloured lines. EXCLUDE: EXISTING, EX., EXIST., TO REMAIN, (E), dashed/greyed.',
demolition: 'DEMOLITION - members to be REMOVED only. INCLUDE: REMOVE, DEMOLISH, DEMO, TO BE REMOVED, (R), crossed out. EXCLUDE: all steel to remain, all new steel.',
all: 'Extract ALL steel. Label each in notes as NEW / EXISTING / REMOVE.'
};
const workInstr = workTypeInstructions[workType||'new'] || workTypeInstructions.new;
const prompt = `You are a senior UK structural steel estimator working for Reynolds & Litchfield Ltd, constructional engineers established 1960. You have 30 years experience doing steel take-offs.
DRAWING TYPE: ${typeDesc}
DRAWING SCALE: ${scaleStr}
WORK TYPE: ${workInstr}
PORTAL FRAMES - HOW TO COUNT:

Count FRAMES from plan view (column grid lines), NOT from elevation
Label as PF1, PF2 etc in dwg field
Each frame = 2 columns + 2 rafters + haunches + ridge
Intermediate columns more common than corner - list separately by section

HAUNCHES:

ALWAYS list haunches separately from rafters
Same section as rafter but shorter length (typically 1000-1500mm)
Qty = same as rafter qty (1 haunch per rafter end at eaves)

BRACING:

CHS bracing lengths VARY per bay - measure each diagonal separately
List per elevation grid: Elevation GL A, GL E, GL 1, GL 8 etc
Vertical bracing and horizontal wind girder are separate items

GALVANISED ITEMS:

Perimeter channels, ground beams, base angles often galvanised
Mark in notes field: galvanised
List separately from non-galvanised steelwork

SECTION SIZES:

Read member schedule or key on drawing
UB: e.g. 406x140x46, 533x210x82, 305x165x40
UC: e.g. 203x203x46, 254x254x89
PFC: e.g. PFC200x75, PFC230x90
CHS: e.g. CHS139.7x4, CHS114.3x3.6
RSA: e.g. RSA100x100x8

DIMENSION READING (PRIORITY):

Read printed dimension text on drawing
Read from member schedule or notes
Calculate from bay spacing x number of bays
Scale from drawing - LAST RESORT, confidence below 65

NEVER DOUBLE COUNT:

Plan qty = correct for columns and frames
Elevations show PROFILE - not additional members
If member appears on plan AND elevation - count once from plan

COLD ROLLED - CALCULATE FROM DRAWING:

Purlin section (e.g. 202Z18) and spacing (e.g. 1800 max centres)
Rail section (e.g. 202C15) and spacing (e.g. 2000 max centres)
Rail levels shown on elevation (e.g. +0.170, +2.170, +4.170)
Eaves beam section (e.g. 230E25)

CALCULATE PURLINS:

purlins per rafter = ROUNDUP(rafter_length / spacing) + 1
Total runs = purlins per side x 2 x number of bays
Each run length = bay spacing
End bays may differ - list separately

CALCULATE CLADDING RAILS:

Count rail levels from elevation
Total runs per elevation = rail levels x number of bays
List SEPARATELY per elevation grid
Show working in flag field

EAVES BEAMS: 1 per bay along each eave, length = bay spacing
OUTPUT FORMAT - Return ONLY CSV, no headers, no markdown:
HOT,dwg_ref,member_type,section,length_mm,qty,kg_per_m,m2_per_m,confidence,flag
COLD,dwg_ref,member_type,section,length_mm,qty,kg_per_m,confidence,flag
confidence: 95+=clearly stated, 80-94=mostly clear, 65-79=some inference, below 65=scaled/guessed
flag: reason if below 80, working for cold rolled, galvanised if galv, POSSIBLE DUPLICATE if repeated
EXAMPLES:
HOT,Plan PF1-7,Column,533x210x82UB,8310,12,82.2,1.8495,95,intermediate cols
HOT,Plan PF1-7,Rafter,406x140x46UB,12080,12,46,1.3386,92,6 bays x2 sides
HOT,Plan PF1-7,Haunch,406x140x46UB,1200,12,46,1.3386,92,1 per rafter end
HOT,Elev GL A,Bracing,CHS139.7x4,6905,2,13.4,0.439,88,diagonal varies per bay
HOT,Plan,Galv Perimeter,PFC200x75,6000,5,23.4,0.6786,90,galvanised
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
