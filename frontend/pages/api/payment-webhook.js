/**
 * pages/api/payment-webhook.js
 * Receives payment confirmation from Flutterwave or Paystack
 * and activates the user's subscription in Supabase.
 */

import { createClient } from '@supabase/supabase-js';

// Use service-role key for server-side Supabase writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_DURATIONS = {
  free:  0,
  pro:   30,   // days
  elite: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'flutterwave';

  try {
    let userId, planKey, status;

    if (provider === 'flutterwave') {
      const { data } = req.body;
      if (!data || data.status !== 'successful') {
        return res.status(200).json({ message: 'Payment not successful, ignored.' });
      }
      // Extract metadata from tx_ref: examai-<timestamp>
      // In production, store planKey + userId in metadata or tx_ref
      userId  = data.meta?.userId  || data.customer?.email; // fallback
      planKey = data.meta?.planKey || 'pro';
      status  = 'active';

    } else {
      // Paystack
      const { event, data } = req.body;
      if (event !== 'charge.success') {
        return res.status(200).json({ message: 'Non-payment event, ignored.' });
      }
      userId  = data.metadata?.userId  || data.customer?.email;
      planKey = data.metadata?.planKey || 'pro';
      status  = 'active';
    }

    if (!userId || !planKey) {
      return res.status(400).json({ error: 'Missing userId or planKey in webhook payload' });
    }

    const daysToAdd  = PLAN_DURATIONS[planKey] || 30;
    const expiresAt  = new Date(Date.now() + daysToAdd * 86400 * 1000).toISOString();

    // Deactivate previous subscriptions
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Insert new subscription
    const { error } = await supabase
      .from('subscriptions')
      .insert([{ user_id: userId, plan: planKey, status, expires_at: expiresAt }]);

    if (error) throw error;

    return res.status(200).json({ success: true, plan: planKey, expires_at: expiresAt });
  } catch (err) {
    console.error('payment-webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
