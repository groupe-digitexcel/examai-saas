import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { supabase, getUserScores, getUserSubscription } from '../lib/supabaseClient';
import { Brain, Zap, CheckCircle2, Target, BookOpen, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudyPlanPage() {
  const router = useRouter();
  const [plan,         setPlan]         = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [generating,   setGenerating]   = useState(false);
  const [targetBand,   setTargetBand]   = useState(7.0);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const [{ data: scores }, { data: sub }, { data: prof }] = await Promise.all([
        getUserScores(user.id),
        getUserSubscription(user.id),
        supabase.from('profiles').select('target_band').eq('id', user.id).single(),
      ]);

      setSubscription(sub);
      if (prof?.target_band) setTargetBand(prof.target_band);
      setLoading(false);
    }
    init();
  }, []);

  async function generatePlan() {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: scores } = await getUserScores(user.id);

      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: scores || [], targetBand }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPlan(data.plan);
      toast.success('Study plan generated!');
    } catch (err) {
      toast.error('Failed: ' + err.message);
    }
    setGenerating(false);
  }

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'elite';

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Head><title>Study Plan — ExamAI</title></Head>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
              <Brain size={20} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">AI Study Plan</h1>
              <p className="text-white/40 font-body text-sm">Personalised 4-week roadmap to your target band</p>
            </div>
          </div>

          {!isPro ? (
            /* ── Upgrade prompt ── */
            <div className="card text-center space-y-4 py-10">
              <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <Lock size={24} className="text-brand-400" />
              </div>
              <h2 className="font-display font-bold text-white text-xl">Pro Feature</h2>
              <p className="text-white/50 font-body text-sm max-w-xs mx-auto">
                The AI Study Plan is available on Pro and Elite plans.
                Upgrade to get a personalised 4-week roadmap.
              </p>
              <button onClick={() => router.push('/#pricing')} className="btn-primary mx-auto">
                <Zap size={15} className="inline mr-1" /> Upgrade to Pro
              </button>
            </div>
          ) : (
            /* ── Plan generator ── */
            <>
              <div className="card flex items-center gap-4">
                <Target size={18} className="text-brand-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-body text-white/60">Target Band Score</p>
                  <select value={targetBand} onChange={e => setTargetBand(parseFloat(e.target.value))}
                    className="input-field mt-1 py-1.5 text-sm">
                    {[5.0,5.5,6.0,6.5,7.0,7.5,8.0,8.5,9.0].map(b => (
                      <option key={b} value={b}>Band {b}</option>
                    ))}
                  </select>
                </div>
                <button onClick={generatePlan} disabled={generating}
                  className="btn-primary shrink-0 flex items-center gap-2 disabled:opacity-50">
                  {generating
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Generating...</>
                    : <><Brain size={15}/>Generate Plan</>}
                </button>
              </div>

              {plan && (
                <div className="space-y-4 animate-slide-up">
                  <div className="card bg-brand-500/10 border-brand-500/30">
                    <p className="text-brand-200 font-body text-sm leading-relaxed">{plan.summary}</p>
                  </div>

                  {plan.weeks?.map((week, i) => (
                    <div key={i} className="card space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-white">Week {week.week}</h3>
                        <span className="badge badge-green text-xs">{week.focus}</span>
                      </div>
                      <ul className="space-y-2">
                        {week.daily_tasks?.map((task, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm font-body text-white/70">
                            <CheckCircle2 size={14} className="text-brand-400 mt-0.5 shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-2 bg-dark-700 rounded-xl p-3">
                        <BookOpen size={14} className="text-brand-400 shrink-0" />
                        <p className="text-xs font-body text-white/60">
                          <span className="text-brand-400 font-semibold">Practice test: </span>
                          {week.practice_test}
                        </p>
                      </div>
                      <p className="text-xs text-white/40 font-body italic">💡 {week.tip}</p>
                    </div>
                  ))}

                  {plan.resources?.length > 0 && (
                    <div className="card space-y-2">
                      <h3 className="font-display font-semibold text-white text-sm">Free Resources</h3>
                      <ul className="space-y-1.5">
                        {plan.resources.map((r, i) => (
                          <li key={i} className="text-sm font-body text-white/60 flex items-start gap-2">
                            <span className="text-brand-400">→</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
