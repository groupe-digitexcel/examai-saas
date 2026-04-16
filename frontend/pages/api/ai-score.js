/**
 * pages/api/ai-score.js
 * Calls Claude API to score exam answers using IELTS band descriptors.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers, type, questions } = req.body;

  if (!answers || !answers.length) {
    return res.status(400).json({ error: 'No answers provided' });
  }

  try {
    // Build the evaluation prompt
    const answersText = answers.map((a, i) => {
      const q = questions?.find(q => q.id === a.questionId);
      return `Question ${i + 1}: ${q?.question || ''}\nAnswer: ${a.answer || '[Audio response submitted]'}`;
    }).join('\n\n---\n\n');

    const prompt = `You are an expert IELTS examiner with 15+ years of experience.

Exam section: ${type.toUpperCase()}

Evaluate the following candidate response(s) using the official IELTS band descriptors.

${answersText}

Provide your evaluation in this EXACT JSON format (no extra text, no markdown):
{
  "band": <number from 1.0 to 9.0, in 0.5 increments>,
  "breakdown": {
    "task_achievement": <1-9>,
    "coherence_cohesion": <1-9>,
    "lexical_resource": <1-9>,
    "grammatical_range": <1-9>
  },
  "feedback": "<3-5 sentences: strengths, weaknesses, and specific improvement tips>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            process.env.ANTHROPIC_API_KEY,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-opus-4-5',
        max_tokens: 800,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', errBody);
      return res.status(502).json({ error: 'AI scoring service unavailable' });
    }

    const aiData = await response.json();
    const rawText = aiData.content?.[0]?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      // Fallback: extract band score from text
      const match = rawText.match(/band[:\s]+([0-9.]+)/i);
      parsed = {
        band:     match ? parseFloat(match[1]) : 5.0,
        feedback: rawText,
        breakdown: { task_achievement:5, coherence_cohesion:5, lexical_resource:5, grammatical_range:5 },
        strengths:    ['Response completed'],
        improvements: ['Review band descriptors for more detail'],
      };
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('ai-score error:', err);
    return res.status(500).json({ error: err.message });
  }
}
