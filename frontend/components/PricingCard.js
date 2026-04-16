import { Check, Zap } from 'lucide-react';

const PLANS = [
  {
    key:      'free',
    label:    'Free',
    price:    '0',
    unit:     'XAF / month',
    desc:     'Get started with basic exam practice.',
    highlight: false,
    features: [
      '3 practice tests per month',
      'Writing test only',
      'Basic AI feedback',
      'Score history (last 5)',
    ],
    cta: 'Start Free',
  },
  {
    key:       'pro',
    label:     'Pro',
    price:     '3,500',
    unit:      'XAF / month',
    desc:      'Full AI-powered exam experience.',
    highlight: true,
    badge:     'Most Popular',
    features: [
      'Unlimited practice tests',
      'All sections: Reading, Writing, Listening',
      'Speaking test with audio AI scoring',
      'Detailed band score breakdown',
      'Progress analytics dashboard',
      'WhatsApp result notifications',
      'Download score certificates',
    ],
    cta: 'Start Pro',
  },
  {
    key:      'elite',
    label:    'Elite',
    price:    '7,500',
    unit:     'XAF / month',
    desc:     'For serious exam takers who want the edge.',
    highlight: false,
    features: [
      'Everything in Pro',
      'AI-personalised study plan',
      'Weakness analysis & drills',
      'Priority support',
      'Affiliate earning dashboard',
      'Offline mode (PWA)',
      'Multi-language interface',
    ],
    cta: 'Go Elite',
  },
];

export default function PricingCard({ onSelectPlan }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {PLANS.map(plan => (
        <div key={plan.key}
          className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200
            ${plan.highlight
              ? 'bg-brand-500/10 border-brand-500 shadow-2xl shadow-brand-500/20 scale-[1.02]'
              : 'bg-dark-800 border-dark-600 hover:border-brand-500/40'
            }`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="badge badge-green px-4 py-1.5 text-xs">
                <Zap size={10} /> {plan.badge}
              </span>
            </div>
          )}

          <div className="mb-5">
            <h3 className="font-display font-bold text-white text-lg">{plan.label}</h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-3xl font-bold font-display text-white">{plan.price}</span>
              <span className="text-sm text-white/40 mb-1 font-body">{plan.unit}</span>
            </div>
            <p className="text-sm text-white/50 mt-1 font-body">{plan.desc}</p>
          </div>

          <ul className="space-y-2.5 flex-1 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-white/70">
                <Check size={15} className="text-brand-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => onSelectPlan?.(plan.key)}
            className={plan.highlight ? 'btn-primary w-full text-center' : 'btn-outline w-full text-center'}
          >
            {plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
