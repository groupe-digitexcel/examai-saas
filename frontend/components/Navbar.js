import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Menu, X, Brain, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const router   = useRouter();
  const [user,   setUser]   = useState(null);
  const [open,   setOpen]   = useState(false);
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    const handleScroll = () => setScroll(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const navLinks = [
    { label: 'Features',  href: '/#features' },
    { label: 'Pricing',   href: '/#pricing'  },
    { label: 'How it Works', href: '/#how'   },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scroll ? 'bg-dark-800/95 backdrop-blur-md border-b border-dark-600 shadow-xl'
             : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center
                          group-hover:bg-brand-400 transition-colors">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">
            Exam<span className="text-brand-400">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors font-body">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
              <button onClick={handleSignOut} className="btn-outline text-sm py-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">Sign In</Link>
              <Link href="/register" className="btn-primary text-sm py-2">Get Started Free</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white/70 hover:text-white"
          onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-800 border-t border-dark-600 px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-white py-2 font-body">
              {l.label}
            </Link>
          ))}
          <div className="border-t border-dark-600 pt-3 space-y-2">
            {user ? (
              <>
                <Link href="/dashboard" className="block btn-ghost text-center">Dashboard</Link>
                <button onClick={handleSignOut} className="w-full btn-outline">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login"    className="block text-center btn-ghost">Sign In</Link>
                <Link href="/register" className="block text-center btn-primary">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
