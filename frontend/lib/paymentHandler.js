/**
 * paymentHandler.js
 * Supports Flutterwave and Paystack — Africa-ready payment integration.
 * Set NEXT_PUBLIC_PAYMENT_PROVIDER=flutterwave or paystack in .env.local
 */

const PROVIDER = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'flutterwave';

const PLANS = {
  free:  { label: 'Free',      price: 0,    currency: 'XAF' },
  pro:   { label: 'Pro',       price: 3500,  currency: 'XAF' },
  elite: { label: 'Elite',     price: 7500,  currency: 'XAF' },
};

export function getPlan(planKey) {
  return PLANS[planKey] || PLANS.free;
}

export function getAllPlans() {
  return Object.entries(PLANS).map(([key, val]) => ({ key, ...val }));
}

/**
 * Initiate Flutterwave inline checkout
 * Requires Flutterwave script loaded in _document.js or via CDN
 */
export function initFlutterwavePayment({ user, planKey, onSuccess, onClose }) {
  const plan = getPlan(planKey);
  if (typeof window === 'undefined' || !window.FlutterwaveCheckout) {
    console.error('Flutterwave script not loaded');
    return;
  }
  window.FlutterwaveCheckout({
    public_key:   process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref:       `examai-${Date.now()}`,
    amount:       plan.price,
    currency:     plan.currency,
    payment_options: 'card, mobilemoneyrwanda, mobilemoneyzambia, mpesa, mobilemoneyghana, ussd',
    customer: {
      email:      user.email,
      name:       user.user_metadata?.full_name || user.email,
    },
    customizations: {
      title:       'ExamAI — ' + plan.label,
      description: 'AI Language Exam Simulator',
      logo:        '/logo.png',
    },
    callback:     onSuccess,
    onclose:      onClose,
  });
}

/**
 * Initiate Paystack inline checkout
 * Requires Paystack script loaded
 */
export function initPaystackPayment({ user, planKey, onSuccess, onClose }) {
  const plan = getPlan(planKey);
  if (typeof window === 'undefined' || !window.PaystackPop) {
    console.error('Paystack script not loaded');
    return;
  }
  const handler = window.PaystackPop.setup({
    key:       process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email:     user.email,
    amount:    plan.price * 100, // kobo
    currency:  plan.currency === 'XAF' ? 'NGN' : plan.currency,
    ref:       'examai_' + Math.floor(Math.random() * 1e9),
    metadata:  { planKey, userId: user.id },
    callback:  onSuccess,
    onClose:   onClose,
  });
  handler.openIframe();
}

/** Dispatch to correct provider */
export function initiatePayment(opts) {
  if (PROVIDER === 'paystack') return initPaystackPayment(opts);
  return initFlutterwavePayment(opts);
}
