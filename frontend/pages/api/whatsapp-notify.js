/**
 * pages/api/whatsapp-notify.js
 * Sends exam results via WhatsApp Cloud API.
 * Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID in .env.local
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, name, band, type, feedback } = req.body;

  if (!phone || !band) return res.status(400).json({ error: 'phone and band are required' });

  const token   = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.warn('WhatsApp credentials not set — skipping notification');
    return res.status(200).json({ skipped: true, reason: 'Credentials not configured' });
  }

  // Format phone: strip spaces/dashes, ensure country code
  const formattedPhone = phone.replace(/[\s\-\(\)]/g, '');

  const emoji = band >= 7 ? '🏆' : band >= 5.5 ? '🎯' : '📚';

  const message =
`${emoji} *ExamAI Result — ${(type || 'exam').toUpperCase()}*

Hello ${name || 'Student'}! Your AI exam result is ready:

🎓 *Band Score: ${band}*

📝 *Feedback:*
${(feedback || '').slice(0, 400)}...

${band < 7
  ? '💡 Want to improve? Upgrade to Pro for unlimited practice and a personalised study plan.'
  : '🌟 Excellent score! Keep practising to maintain your level.'}

👉 View full results: ${process.env.NEXT_PUBLIC_APP_URL || 'https://examai.app'}/results`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to:                formattedPhone,
          type:              'text',
          text:              { body: message },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'WhatsApp API error');

    return res.status(200).json({ success: true, messageId: data.messages?.[0]?.id });
  } catch (err) {
    console.error('whatsapp-notify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
