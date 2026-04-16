import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from '../lib/supabaseClient';
import { Brain, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) { toast.error(error.message); }
    else { toast.success('Welcome back!'); router.push('/dashboard'); }
    setLoading(false);
  }

  return (
    <>
      <Head><title>Sign In — ExamAI</title></Head>
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
            <h1 className="text-2xl font-bold font-display text-white">Welcome back</h1>
            <p className="text-white/40 font-body text-sm">Sign in to continue your practice</p>
          </div>
          <form onSubmit={handleLogin} className="card space-y-4">
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
                <input type={showPw?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)}
                  className="input-field pl-9 pr-10" placeholder="••••••••" />
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading?<><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Signing in...</>:'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-white/40 font-body">
            No account?{' '}<Link href="/register" className="text-brand-400 hover:text-brand-300 font-semibold">Create one free</Link>
          </p>
        </div>
      </div>
    </>
  );
}
