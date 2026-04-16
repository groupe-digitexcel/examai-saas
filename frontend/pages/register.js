import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signUp } from '../lib/supabaseClient';
import { Brain, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { plan = 'free' } = router.query;
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, { data: { full_name: name } });
    if (error) { toast.error(error.message); }
    else {
      toast.success('Account created! Check your email to confirm.');
      if (plan !== 'free') router.push('/dashboard?upgrade=' + plan);
      else router.push('/dashboard');
    }
    setLoading(false);
  }

  return (
    <>
      <Head><title>Create Account — ExamAI</title></Head>
      <div className="min-h-screen bg-dark-900 grid-bg flex items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative w-full max-w-sm space-y-6 animate-slide-up">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 justify-center">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <Brain size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-white text-xl">Exam<span className="text-brand-400">AI</span></span>
            </Link>
            <h1 className="text-2xl font-bold font-display text-white">Create your account</h1>
            <p className="text-white/40 font-body text-sm">
              {plan !== 'free' ? `Getting started with ${plan.charAt(0).toUpperCase()+plan.slice(1)} plan` : 'Start free — no credit card needed'}
            </p>
          </div>
          <form onSubmit={handleRegister} className="card space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" required value={name} onChange={e=>setName(e.target.value)}
                  className="input-field pl-9" placeholder="Your full name" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                  className="input-field pl-9" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/50 font-display uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}
                  className="input-field pl-9" placeholder="Min. 8 characters" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading?<><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Creating account...</>:'Create Account'}
            </button>
            <p className="text-center text-xs text-white/30 font-body">
              By signing up you agree to our <Link href="/terms" className="text-brand-400 hover:underline">Terms</Link> and <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
            </p>
          </form>
          <p className="text-center text-sm text-white/40 font-body">
            Already have an account?{' '}<Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
