import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import ScoreChart from '../components/ScoreChart';
import { supabase, getUserScores } from '../lib/supabaseClient';
import { Trophy, TrendingUp, FileText, Mic, BookOpen, Headphones, Filter } from 'lucide-react';

const TYPE_ICONS = {
  writing:   FileText,
  speaking:  Mic,
  reading:   BookOpen,
  listening: Headphones,
};

export default function ResultsPage() {
  const router = useRouter();
  const [scores,  setScores]  = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await getUserScores(user.id);
      setScores(data || []);
      setLoading(false);
    }
    init();
  }, []);

  const filtered  = filter === 'all' ? scores : scores.filter(s => s.exams?.type === filter);
  const avgScore  = filtered.length ? (filtered.reduce((a,s)=>a+parseFloat(s.score),0)/filtered.length).toFixed(1) : 0;
  const best      = filtered.length ? Math.max(...filtered.map(s=>parseFloat(s.score))).toFixed(1) : 0;
  const bandColor = b => b >= 7 ? 'badge-green' : b >= 5.5 ? 'badge-yellow' : 'badge-red';

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Head><title>My Results — ExamAI</title></Head>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto mt-6 space-y-8">
          <h1 className="text-2xl font-bold font-display text-white">My Results</h1>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Tests Taken',  value: filtered.length, icon: Trophy    },
              { label: 'Average Band', value: avgScore,        icon: TrendingUp },
              { label: 'Best Band',    value: best,            icon: Trophy     },
            ].map((s,i) => (
              <div key={i} className="card text-center space-y-1">
                <s.icon size={18} className="text-brand-400 mx-auto" />
                <p className="text-2xl font-bold font-display text-white">{s.value}</p>
                <p className="text-xs text-white/40 font-body">{s.label}</p>
              </div>
            ))}
          </div>

          {filtered.length > 1 && (
            <div className="card">
              <h2 className="font-display font-semibold text-white mb-4">Band Score Over Time</h2>
              <ScoreChart scores={filtered} />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-white/30" />
            {['all','writing','speaking','reading','listening'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display capitalize transition-all
                  ${filter === f
                    ? 'bg-brand-500 text-white'
                    : 'bg-dark-700 text-white/50 hover:text-white border border-dark-600'}`}>
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card text-center py-12 text-white/30 font-body">
              No results yet. Take a test to see your scores here!
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((s, i) => {
                const examType = s.exams?.type || 'writing';
                const Icon = TYPE_ICONS[examType] || FileText;
                return (
                  <div key={i} className="card-hover space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-white text-sm">
                          {s.exams?.title || `${examType.charAt(0).toUpperCase() + examType.slice(1)} Test`}
                        </p>
                        <p className="text-xs text-white/30 font-body">
                          {new Date(s.created_at).toLocaleDateString('en-GB', {
                            weekday:'short', day:'numeric', month:'short', year:'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`badge ${bandColor(s.score)} shrink-0`}>
                        Band {parseFloat(s.score).toFixed(1)}
                      </span>
                    </div>
                    {s.feedback && (
                      <div className="bg-dark-700 rounded-xl p-3 text-sm text-white/60 font-body leading-relaxed line-clamp-3">
                        {s.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
