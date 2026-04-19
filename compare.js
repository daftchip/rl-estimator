export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { revA, revB } = req.body || {};
  if (!revA || !revB) return res.status(400).json({ error: 'Both Rev A and Rev B PDFs required' });
  if (!revA.startsWith('JVBERi') || !revB.startsWith('JVBERi'))
    return res.status(400).json({ error: 'Invalid files — please upload PDF drawings' });

  const prompt = `You are a senior structural steel estimator comparing two revisions of engineering drawings.

You will receive TWO drawings:
- Document 1 = Rev A (previous issue / original)  
- Document 2 = Rev B (new issue / latest)

Your task: Identify ALL changes between Rev A and Rev B.

Return ONLY a raw JSON object, no markdown, no explanation:
{
  "added": [
    {"type":"","section":"","length":0,"qty":0,"dwg":"","notes":"what was added"}
  ],
  "removed": [
    {"type":"","section":"","length":0,"qty":0,"dwg":"","notes":"what was removed"}
  ],
  "changed": [
    {"type":"","section":"","dwg":"","change":"describe the change e.g. length increased from 4500 to 5200mm, qty increased from 4 to 6"}
  ],
  "costDiff": 0,
  "revBMembers": {
    "hotRolled": [{"dwg":"","type":"","section":"","length":0,"qty":0,"kgm":0,"m2m":0,"notes":""}],
    "coldRolled": [{"dwg":"","type":"","section":"","length":0,"qty":0,"kgm":0,"notes":""}]
  }
}

Rules:
- added = members in Rev B that are NOT in Rev A
- removed = members in Rev A that are NOT in Rev B  
- changed = members that exist in both but have different sizes, lengths, quantities or grades
- costDiff = estimated cost difference in £ (use £1000/T for hot rolled steel as a rough guide)
- revBMembers = complete take-off of ALL members from Rev B (for importing to take-off sheet)
- Be specific about changes — state old value and new value
- If drawings are identical, return empty arrays
- section = full UK designation e.g. 203x203x46UC, 457x191x82UB
- length in mm, qty as number`;

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
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: revA }, title: 'Rev A - Previous Issue' },
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: revB }, title: 'Rev B - New Issue' },
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
    try { data = JSON.parse(respText); } catch(e) { return res.status(502).json({ error: 'Invalid AI response' }); }
    if (data.type === 'error') return res.status(502).json({ error: data.error?.message || 'AI error' });

    const raw = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
    if (!raw) return res.status(502).json({ error: 'No response from AI' });

    let parsed;
    try {
      const first = raw.indexOf('{');
      const last = raw.lastIndexOf('}');
      if (first === -1 || last === -1) throw new Error('No JSON');
      parsed = JSON.parse(raw.slice(first, last + 1));
    } catch(e) {
      return res.status(502).json({ error: 'Could not parse comparison result: ' + raw.slice(0, 150) });
    }

    return res.status(200).json({
      added: parsed.added || [],
      removed: parsed.removed || [],
      changed: parsed.changed || [],
      costDiff: parsed.costDiff || 0,
      revBMembers: parsed.revBMembers || { hotRolled: [], coldRolled: [] }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
