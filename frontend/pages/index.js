import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import PricingCard from '../components/PricingCard';
import { useRouter } from 'next/router';
import {
  Brain, Zap, Mic, BarChart2, Globe, Shield,
  Star, ArrowRight, CheckCircle2, Users, Award,
} from 'lucide-react';

const FEATURES = [
  { icon: Brain,    title: 'AI Band Scoring',      desc: 'Get instant IELTS-style band scores (1–9) powered by Claude AI — like a real examiner.' },
  { icon: Mic,      title: 'Speaking Test',         desc: 'Record your answers and receive AI-scored fluency, pronunciation, and coherence feedback.' },
  { icon: BarChart2,title: 'Progress Analytics',   desc: 'Track your band score over time, identify weaknesses, and hit your target band faster.' },
  { icon: Zap,      title: 'Instant Feedback',      desc: 'No waiting. Get grammar, vocabulary, and coherence tips the moment you submit.' },
  { icon: Globe,    title: 'Multi-language UI',     desc: 'Interface available in English and French — designed for Cameroon and francophone Africa.' },
  { icon: Shield,   title: 'Real Exam Simulation',  desc: 'Timed sections, authentic question types, and strict marking criteria — just like the real test.' },
];

const STEPS = [
  { num: '01', title: 'Create account',  desc: 'Sign up free in seconds — no credit card needed.' },
  { num: '02', title: 'Choose a section', desc: 'Pick Writing, Speaking, Reading, or Listening.' },
  { num: '03', title: 'Take the test',    desc: 'Answer AI-generated questions under real exam conditions.' },
  { num: '04', title: 'Get your score',  desc: 'Receive an instant band score with detailed improvement tips.' },
];

const TESTIMONIALS = [
  { name: 'Amara K.', country: 'Yaoundé, CM', score: '7.0', text: 'I went from band 5.5 to 7.0 in 8 weeks. The AI feedback showed exactly where I was losing marks.' },
  { name: 'Fatou D.', country: 'Dakar, SN', score: '6.5', text: 'The speaking test is amazing. I was scared at first but it really helped my confidence.' },
  { name: 'Kwame A.', country: 'Accra, GH', score: '7.5', text: "Worth every franc. The instant feedback is better than some human tutors I've used." },
];

export default function HomePage() {
  const router = useRouter();

  function handlePlanSelect(key) {
    router.push(`/register?plan=${key}`);
  }

  return (
    <>
      <Head>
        <title>ExamAI — Pass Your Language Exam with AI</title>
        <meta name="description" content="AI-powered IELTS exam simulator with instant band scoring, speaking test, and progress analytics. Built for Africa." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="overflow-hidden">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center pt-20 grid-bg">
          {/* Glow blobs */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10
                          rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-brand-700/10
                          rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 py-24 text-center space-y-8">
            <div className="inline-flex items-center gap-2 badge badge-green text-sm px-4 py-2">
              <Zap size={13} /> Africa's #1 AI Exam Simulator
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-display text-white
                           leading-tight tracking-tight">
              Pass Your Language<br />
              <span className="gradient-text">Exam with AI</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 font-body leading-relaxed">
              Practice IELTS, DELF, and TOEFL-style exams with instant AI scoring.
              Get real band scores, detailed feedback, and a personalised study plan — all on your phone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2 justify-center">
                Start Free Test <ArrowRight size={18} />
              </Link>
              <Link href="#how" className="btn-outline text-base px-8 py-4">
                See How It Works
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-1.5 text-sm text-white/40 font-body">
                <Users size={14} className="text-brand-400" />
                <span><strong className="text-white">2,400+</strong> students</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/40 font-body">
                <Award size={14} className="text-brand-400" />
                <span>Avg. band improvement: <strong className="text-white">+1.5</strong></span>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_,i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-white/40 ml-1.5 font-body">4.9/5</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section id="features" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <h2 className="section-title">Everything You Need to <span className="gradient-text">Score Higher</span></h2>
              <p className="section-sub">Designed for serious candidates across Africa and beyond.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <div key={i} className="card-hover group">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center
                                  mb-4 group-hover:bg-brand-500/30 transition-colors">
                    <f.icon size={20} className="text-brand-400" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm font-body leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section id="how" className="py-24 px-4 bg-dark-800/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
              <p className="section-sub">Four simple steps to your target band score.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((s, i) => (
                <div key={i} className="text-center space-y-3">
                  <div className="text-4xl font-bold font-display text-brand-500/30">{s.num}</div>
                  <h3 className="font-display font-semibold text-white">{s.title}</h3>
                  <p className="text-white/50 text-sm font-body">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute right-0 top-1/2 text-brand-500/20 text-2xl">›</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <h2 className="section-title">Real <span className="gradient-text">Results</span></h2>
              <p className="section-sub">From students across Africa who used ExamAI to hit their target.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="card space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_,j) => (
                        <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="badge badge-green">Band {t.score}</span>
                  </div>
                  <p className="text-white/70 text-sm font-body leading-relaxed italic">"{t.text}"</p>
                  <div>
                    <p className="text-white font-semibold font-display text-sm">{t.name}</p>
                    <p className="text-white/30 text-xs font-body">{t.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-4 bg-dark-800/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <h2 className="section-title">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
              <p className="section-sub">Affordable plans for every student in Africa. Pay with MoMo or Orange Money.</p>
            </div>
            <PricingCard onSelectPlan={handlePlanSelect} />
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="section-title">Your Target Band Score<br /><span className="gradient-text">Starts Today</span></h2>
            <p className="section-sub">Join 2,400+ students already practising with ExamAI. First 3 tests are free.</p>
            <Link href="/register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-brand-400" />
            <span className="font-display font-bold text-white">Exam<span className="text-brand-400">AI</span></span>
          </div>
          <p className="text-white/30 text-sm font-body">
            © {new Date().getFullYear()} ExamAI · Powered by Groupe Digitexcel Cameroon
          </p>
          <div className="flex gap-4 text-sm text-white/40 font-body">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
