import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/* ─── Auth helpers ─────────────────────────────────────────── */

export async function signUp(email, password) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/* ─── Subscription helper ──────────────────────────────────── */

export async function getUserSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

/* ─── Scores helper ─────────────────────────────────────────── */

export async function getUserScores(userId) {
  const { data, error } = await supabase
    .from('scores')
    .select('*, exams(title, type)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

/* ─── Save score ────────────────────────────────────────────── */

export async function saveScore({ userId, examId, score, feedback }) {
  const { data, error } = await supabase
    .from('scores')
    .insert([{ user_id: userId, exam_id: examId, score, feedback }])
    .select()
    .single();
  return { data, error };
}
