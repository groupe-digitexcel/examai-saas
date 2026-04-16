import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { User, Phone, Target, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState({ full_name: '', phone: '', target_band: 7.0, language: 'en' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(prev => ({ ...prev, ...data }));
      setLoading(false);
    }
    init();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message);
    else toast.success('Profile updated!');
    setSaving(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Head><title>My Profile — ExamAI</title></Head>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto mt-6 space-y-6">
          <h1 className="text-2xl font-bold font-display text-white">My Profile</h1>

          <form onSubmit={handleSave} className="card space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={profile.full_name || ''} onChange={e=>setProfile(p=>({...p,full_name:e.target.value}))}
                  className="input-field pl-9" placeholder="Your full name" />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">Email</label>
              <input type="email" value={user?.email || ''} disabled
                className="input-field opacity-50 cursor-not-allowed" />
            </div>

            {/* Phone for WhatsApp */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">
                WhatsApp Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="tel" value={profile.phone || ''} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}
                  className="input-field pl-9" placeholder="+237 6XX XXX XXX" />
              </div>
              <p className="text-xs text-white/30 font-body">Used to receive your results via WhatsApp.</p>
            </div>

            {/* Target band */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">
                Target Band Score
              </label>
              <div className="relative">
                <Target size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <select value={profile.target_band} onChange={e=>setProfile(p=>({...p,target_band:parseFloat(e.target.value)}))}
                  className="input-field pl-9 appearance-none">
                  {[5.0,5.5,6.0,6.5,7.0,7.5,8.0,8.5,9.0].map(b => (
                    <option key={b} value={b}>Band {b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">
                Interface Language
              </label>
              <div className="relative">
                <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <select value={profile.language} onChange={e=>setProfile(p=>({...p,language:e.target.value}))}
                  className="input-field pl-9 appearance-none">
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Saving...</>
                : <><Save size={15}/>Save Profile</>}
            </button>
          </form>

          {/* Affiliate code */}
          {profile.affiliate_code && (
            <div className="card space-y-2">
              <p className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">Your Affiliate Code</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-dark-700 rounded-lg px-3 py-2 text-brand-400 font-mono text-sm">
                  {profile.affiliate_code}
                </code>
                <button onClick={() => {
                  navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${profile.affiliate_code}`);
                  toast.success('Referral link copied!');
                }} className="btn-outline text-sm py-2">Copy Link</button>
              </div>
              <p className="text-xs text-white/30 font-body">Share this link to earn rewards on every signup.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
