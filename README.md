# 🎓 ExamAI SaaS — AI Language Exam Simulator

**Africa-ready IELTS-style exam simulator** with AI band scoring, speaking test, progress analytics,
and Flutterwave/Paystack payment integration. Built with Next.js + Supabase.

---

## 🚀 Quick Start

### 1. Clone & install

```bash
cd frontend
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy your **Project URL** and **anon key** from Settings > API
3. Open **SQL Editor** and run `supabase/schema.sql`
4. Then run `supabase/policies.sql`
5. In Storage, create a bucket called `exam-audio` (private)

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your keys
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
frontend/
├── pages/
│   ├── index.js          # Landing page
│   ├── login.js          # Sign in
│   ├── register.js       # Sign up
│   ├── dashboard.js      # User dashboard
│   ├── exam.js           # Exam interface (timer + questions)
│   ├── results.js        # Score history + chart
│   └── api/
│       ├── ai-score.js           # Claude AI scoring endpoint
│       ├── generate-questions.js # AI question generator
│       ├── payment-webhook.js    # Flutterwave/Paystack webhook
│       └── whatsapp-notify.js    # WhatsApp result notification
├── components/
│   ├── Navbar.js         # Responsive navigation
│   ├── Timer.js          # Animated countdown ring
│   ├── QuestionCard.js   # Writing, MCQ, Speaking cards
│   ├── AudioRecorder.js  # MediaRecorder + Supabase upload
│   ├── PricingCard.js    # 3-tier pricing (XAF)
│   └── ScoreChart.js     # Recharts line chart
├── lib/
│   ├── supabaseClient.js # Supabase client + helpers
│   └── paymentHandler.js # Flutterwave / Paystack init
├── styles/
│   └── globals.css       # Tailwind + custom design system
supabase/
├── schema.sql            # All tables + triggers
└── policies.sql          # Row Level Security
```

---

## 💳 Payment Setup

### Flutterwave (recommended for Cameroon)
1. Register at [flutterwave.com](https://flutterwave.com)
2. Get test keys from Dashboard > Settings > API
3. Set webhook URL: `https://your-domain.com/api/payment-webhook`

### Paystack (alternative)
1. Register at [paystack.com](https://paystack.com)
2. Get test keys from Settings > API Keys
3. Set webhook URL: `https://your-domain.com/api/payment-webhook`

---

## 🤖 AI Scoring

Uses **Claude** (Anthropic) as the IELTS examiner. Scoring covers:
- Task Achievement
- Coherence & Cohesion
- Lexical Resource
- Grammatical Range & Accuracy

Get your API key at [console.anthropic.com](https://console.anthropic.com)

---

## 📱 WhatsApp Notifications

After each test, results are sent via WhatsApp Cloud API.
1. Set up a Meta Developer account
2. Create a WhatsApp Business app
3. Add your `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID` to `.env.local`

---

## 🚢 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings > Environment Variables
```

Or push to GitHub and connect to Vercel for auto-deploy.

---

## 🗺️ Roadmap

- [ ] Listening test with audio playback
- [ ] AI study plan generator
- [ ] Leaderboard
- [ ] PWA / offline mode
- [ ] Multi-language UI (French)
- [ ] Affiliate dashboard

---

Built with ❤️ by **Groupe Digitexcel Cameroon** · [digitexcel.com](https://digitexcel.com)
