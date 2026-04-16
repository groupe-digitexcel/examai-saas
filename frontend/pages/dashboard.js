import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import ScoreChart from '../components/ScoreChart';
import { supabase, getUserScores, getUserSubscription } from '../lib/supabaseClient';
import {
  Brain, Play, Award, TrendingUp, Clock, Star, Zap,
  ChevronRight, BookOpen, Mic, FileText, Headphones,
} from 'lucide-react';

const EXAM_TYPES = [
  { key: 'writing',   label: 'Writing',   icon: FileText,    desc: 'Task 1 & Task 2',           color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  { key: 'speaking',  label: 'Speaking',  icon: Mic,         desc: 'Parts 1, 2 & 3',            color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { key: 'reading',   label: 'Reading',   icon: BookOpen,    desc: '40 questions in 60 min',    color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { key: 'listening', label: 'Listening', icon: Headphones,  desc: '4 sections, 40 questions',  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30' },
];

export default function Dashboard() {
  const router = useRouter();
  const [user,         setUser]         = useState(null);
  const [scores,       setScores]       = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const [{ data: s }, { data: sub }] = await Promise.all([
        getUserScores(user.id),
        getUserSubscription(user.id),
      ]);
      setScores(s || []);
      setSubscription(sub);
      setLoading(false);
    }
    init();
  }, []);

  function startExam(type) {
    router.push(`/exam?type=${type}`);
  }

  const avgScore   = scores.length ? (scores.reduce((a,s)=>a+parseFloat(s.score),0)/scores.length).toFixed(1) : '—';
  const bestScore  = scores.length ? Math.max(...scores.map(s=>parseFloat(s.score))).toFixed(1) : '—';
  const plan       = subscription?.plan || 'free';

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard — ExamAI</title>
      </Head>
      <Navbar />

      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mt-4">
            <div>
              <h1 className="text-2xl font-bold font-display text-white">
                Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''} 👋
              </h1>
              <p className="text-white/40 font-body mt-1">Ready to practise today?</p>
            </div>
            <span className={`badge mt-1 ${plan === 'free' ? 'badge-gray' : plan === 'pro' ? 'badge-green' : 'badge-yellow'}`}>
              <Zap size={11} /> {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tests Taken',  value: scores.length,  icon: Play    },
              { label: 'Avg. Band',    value: avgScore,       icon: TrendingUp },
              { label: 'Best Score',   value: bestScore,      icon: Award   },
              { label: 'Day Streak',   value: '—',            icon: Star    },
            ].map((s, i) => (
              <div key={i} className="card flex flex-col gap-1">
                <s.icon size={16} className="text-brand-400" />
                <p className="text-2xl font-bold font-display text-white mt-1">{s.value}</p>
                <p className="text-xs text-white/40 font-body">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Start a test */}
          <div>
            <h2 className="font-display font-semibold text-white mb-4">Start a Practice Test</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXAM_TYPES.map(et => (
                <button
                  key={et.key}
                  onClick={() => startExam(et.key)}
                  className={`card text-left hover:scale-[1.02] transition-all duration-150
                              hover:border-brand-500/40 active:scale-[0.99] group`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3
                                   ${et.bg} border ${et.border}`}>
                    <et.icon size={17} className={et.color} />
                  </div>
                  <p className="font-display font-semibold text-white text-sm">{et.label}</p>
                  <p className="text-xs text-white/40 font-body mt-0.5">{et.desc}</p>
                  <ChevronRight size={14} className="text-brand-400 mt-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Progress chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-white">Band Score Progress</h2>
              {scores.length > 0 && (
                <Link href="/results" className="text-sm text-brand-400 hover:text-brand-300 font-body">
                  View all →
                </Link>
              )}
            </div>
            <ScoreChart scores={scores.slice(0,10)} />
          </div>

          {/* Recent results */}
          {scores.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-white mb-4">Recent Results</h2>
              <div className="space-y-2">
                {scores.slice(0, 5).map((s, i) => (
                  <div key={i} className="card-hover flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0`}>
                      <Brain size={16} className="text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-medium text-white text-sm truncate">
                        {s.exams?.title || `${s.exams?.type || 'Exam'} Practice`}
                      </p>
                      <p className="text-xs text-white/30 font-body">
                        {new Date(s.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                    </div>
                    <span className={`badge shrink-0 ${
                      s.score >= 7 ? 'badge-green' : s.score >= 5.5 ? 'badge-yellow' : 'badge-red'
                    }`}>
                      Band {parseFloat(s.score).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade prompt for free users */}
          {plan === 'free' && (
            <div className="card bg-brand-500/10 border-brand-500/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-brand-400" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-white">Upgrade to Pro</p>
                  <p className="text-sm text-white/50 font-body">Unlock unlimited tests, speaking AI scoring, and WhatsApp notifications.</p>
                </div>
                <Link href="/#pricing" className="btn-primary text-sm py-2 shrink-0">Upgrade — 3,500 XAF/mo</Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
