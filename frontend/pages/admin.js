/**
 * pages/admin.js
 * Admin-only dashboard: user stats, recent scores, subscription overview.
 * Protect this route by checking user email = admin email.
 */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { Users, TrendingUp, CreditCard, Activity } from 'lucide-react';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@examai.app';

export default function AdminPage() {
  const router = useRouter();
  const [stats,   setStats]   = useState({ users: 0, scores: 0, pro: 0, elite: 0 });
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
        return;
      }

      // Fetch aggregate stats using Supabase
      const [
        { count: userCount },
        { count: scoreCount },
        { count: proCount },
        { count: eliteCount },
        { data: recentScores },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('scores').select('*',   { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true })
          .eq('plan', 'pro').eq('status', 'active'),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true })
          .eq('plan', 'elite').eq('status', 'active'),
        supabase.from('scores')
          .select('score, created_at, exams(type)')
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      setStats({ users: userCount||0, scores: scoreCount||0, pro: proCount||0, elite: eliteCount||0 });
      setRecent(recentScores || []);
      setLoading(false);
    }
    init();
  }, []);

  const KPI = ({ label, value, icon: Icon, sub }) => (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40 font-body uppercase tracking-wider">{label}</p>
        <Icon size={16} className="text-brand-400" />
      </div>
      <p className="text-3xl font-bold font-display text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 font-body">{sub}</p>}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Head><title>Admin — ExamAI</title></Head>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto mt-6 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-display text-white">Admin Dashboard</h1>
            <span className="badge badge-yellow">Admin</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPI label="Total Users"    value={stats.users}  icon={Users}      sub="registered accounts" />
            <KPI label="Tests Taken"    value={stats.scores} icon={Activity}   sub="all time" />
            <KPI label="Pro Subs"       value={stats.pro}    icon={CreditCard} sub="active" />
            <KPI label="Elite Subs"     value={stats.elite}  icon={TrendingUp} sub="active" />
          </div>

          <div className="card">
            <h2 className="font-display font-semibold text-white mb-4">Recent Test Activity</h2>
            {recent.length === 0 ? (
              <p className="text-white/30 font-body text-sm text-center py-8">No test data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="text-white/30 text-xs uppercase border-b border-dark-600">
                      <th className="text-left pb-3 pr-4">Date</th>
                      <th className="text-left pb-3 pr-4">Type</th>
                      <th className="text-right pb-3">Band</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-600">
                    {recent.map((s, i) => (
                      <tr key={i} className="text-white/70">
                        <td className="py-2.5 pr-4 text-white/40 text-xs">
                          {new Date(s.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                        <td className="py-2.5 pr-4 capitalize">{s.exams?.type || '—'}</td>
                        <td className="py-2.5 text-right">
                          <span className={`badge text-xs ${
                            s.score >= 7 ? 'badge-green' : s.score >= 5.5 ? 'badge-yellow' : 'badge-red'
                          }`}>
                            {parseFloat(s.score).toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
