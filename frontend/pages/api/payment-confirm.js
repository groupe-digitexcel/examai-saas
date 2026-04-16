/**
 * POST /api/payment-confirm
 * Called after a successful Flutterwave or Paystack payment.
 * Upgrades the user's subscription in Supabase.
 *
 * Body: { userId, plan, reference }
 */

import { createClient } from '@supabase/supabase-js';

// Use service role key server-side to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_DURATIONS = {
  pro:   30,   // days
  elite: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, plan, reference } = req.body;

  if (!userId || !plan || !reference) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Optional: Verify payment with Flutterwave/Paystack API here before upgrading
  // For MVP we trust the frontend callback — add server-side verification for production

  const days      = PLAN_DURATIONS[plan] || 30;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Deactivate old subscriptions
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Insert new active subscription
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .insert([{
        user_id:    userId,
        plan,
        status:     'active',
        expires_at: expiresAt,
        reference,
      }]);

    if (error) throw error;

    // Optional: Send WhatsApp notification
    if (process.env.WHATSAPP_API_TOKEN) {
      await sendWhatsAppNotification(userId, plan);
    }

    return res.status(200).json({ success: true, plan, expires_at: expiresAt });

  } catch (err) {
    console.error('Payment confirm error:', err);
    return res.status(500).json({ error: 'Failed to activate subscription: ' + err.message });
  }
}

async function sendWhatsAppNotification(userId, plan) {
  try {
    // Fetch user email to look up phone (extend subscriptions table with phone for full integration)
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    const phone = user?.user?.user_metadata?.phone;
    if (!phone) return;

    const message = `🎉 ExamAI — ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated! You now have unlimited AI-scored practice tests. Good luck with your exam! 🏆`;

    await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to:    phone,
        type:  'text',
        text:  { body: message },
      }),
    });
  } catch (err) {
    console.error('WhatsApp notification failed:', err.message);
    // Non-fatal — don't throw
  }
}
