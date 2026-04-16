-- =====================================================
-- ExamAI — Row Level Security Policies
-- Run AFTER schema.sql
-- =====================================================

-- Enable RLS on all tables
alter table profiles       enable row level security;
alter table answers        enable row level security;
alter table scores         enable row level security;
alter table subscriptions  enable row level security;
alter table questions      enable row level security;
alter table exams          enable row level security;

-- ─── PROFILES ─────────────────────────────────────
create policy "Users view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- ─── ANSWERS ──────────────────────────────────────
create policy "Users view own answers"
  on answers for select using (auth.uid() = user_id);

create policy "Users insert own answers"
  on answers for insert with check (auth.uid() = user_id);

-- ─── SCORES ───────────────────────────────────────
create policy "Users view own scores"
  on scores for select using (auth.uid() = user_id);

create policy "Users insert own scores"
  on scores for insert with check (auth.uid() = user_id);

-- ─── SUBSCRIPTIONS ────────────────────────────────
create policy "Users view own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via webhook)
create policy "Service role manages subscriptions"
  on subscriptions for all using (auth.role() = 'service_role');

-- ─── EXAMS & QUESTIONS (public read) ──────────────
create policy "Anyone can read exams"
  on exams for select using (true);

create policy "Anyone can read questions"
  on questions for select using (true);

-- ─── STORAGE BUCKET POLICY ────────────────────────
-- Run this in Storage > Policies after creating bucket 'exam-audio'
-- insert into storage.buckets (id, name, public) values ('exam-audio', 'exam-audio', false);

-- create policy "Auth users upload audio"
--   on storage.objects for insert
--   with check (bucket_id = 'exam-audio' and auth.role() = 'authenticated');

-- create policy "Users view own audio"
--   on storage.objects for select
--   using (bucket_id = 'exam-audio' and auth.uid()::text = (storage.foldername(name))[2]);
