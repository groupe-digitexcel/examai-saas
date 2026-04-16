/**
 * pages/api/study-plan.js
 * Generates a personalised AI study plan based on score history and target band.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { scores = [], targetBand = 7.0, weaknesses = [] } = req.body;

  const avgScore = scores.length
    ? (scores.reduce((a, s) => a + parseFloat(s.score), 0) / scores.length).toFixed(1)
    : 'unknown';

  const prompt = `You are an expert IELTS coach creating a personalised study plan.

Student profile:
- Current average band score: ${avgScore}
- Target band score: ${targetBand}
- Weak areas identified: ${weaknesses.length ? weaknesses.join(', ') : 'general improvement needed'}
- Tests taken: ${scores.length}

Create a focused 4-week study plan. Return ONLY valid JSON (no markdown):
{
  "summary": "<2-sentence overview of the plan and goal>",
  "weeks": [
    {
      "week": 1,
      "focus": "<main focus area>",
      "daily_tasks": [
        "<task 1 — 15-30 min>",
        "<task 2 — 15-30 min>",
        "<task 3 — 15-30 min>"
      ],
      "practice_test": "<which ExamAI section to practice this week>",
      "tip": "<one actionable coaching tip>"
    }
  ],
  "resources": [
    "<free resource 1>",
    "<free resource 2>"
  ]
}`;

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

    const aiData  = await response.json();
    const rawText = aiData.content?.[0]?.text || '{}';
    const plan    = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    return res.status(200).json({ plan });
  } catch (err) {
    console.error('study-plan error:', err);
    return res.status(500).json({ error: err.message });
  }
}
