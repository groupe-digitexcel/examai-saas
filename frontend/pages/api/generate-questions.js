/**
 * pages/api/generate-questions.js
 * Generates fresh IELTS-style questions using Claude AI.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type = 'writing', count = 2, difficulty = 'intermediate' } = req.body;

  const prompt = `You are an expert IELTS question writer.

Generate ${count} authentic IELTS-style ${type} question(s) at ${difficulty} level.

Return ONLY a valid JSON array with this structure (no markdown, no extra text):
[
  {
    "id": "q_<unique_6char_id>",
    "type": "${type === 'reading' ? 'mcq' : type}",
    "exam_id": "ielts-${type}",
    "question": "<full question text>",
    ${type === 'reading' ? `"options": ["<A>", "<B>", "<C>", "<D>"],` : ''}
    ${type === 'writing' ? `"min_words": ${type === 'writing' ? 150 : 0},` : ''}
    "difficulty": "${difficulty}"
  }
]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-opus-4-5',
        max_tokens: 1200,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error('AI service error');

    const aiData  = await response.json();
    const rawText = aiData.content?.[0]?.text || '[]';
    const clean   = rawText.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    return res.status(200).json({ questions });
  } catch (err) {
    console.error('generate-questions error:', err);
    return res.status(500).json({ error: err.message });
  }
}
