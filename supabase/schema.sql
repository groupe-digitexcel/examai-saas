-- =====================================================
-- ExamAI SaaS — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

create extension if not exists "uuid-ossp";

-- ─── EXAMS ────────────────────────────────────────
create table if not exists exams (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  type       text not null check (type in ('writing','speaking','reading','listening')),
  duration   int  not null default 3600,
  difficulty text not null default 'intermediate',
  created_at timestamptz default now()
);

insert into exams (title, type, duration, difficulty) values
  ('IELTS Writing Practice',    'writing',   3600, 'intermediate'),
  ('IELTS Speaking Simulation', 'speaking',   900, 'intermediate'),
  ('IELTS Reading Test',        'reading',   3600, 'intermediate'),
  ('IELTS Listening Test',      'listening', 1800, 'intermediate')
on conflict do nothing;

-- ─── QUESTIONS ────────────────────────────────────
create table if not exists questions (
  id          uuid primary key default uuid_generate_v4(),
  exam_id     uuid references exams(id) on delete cascade,
  question    text not null,
  type        text not null check (type in ('writing','speaking','mcq','listening')),
  options     jsonb,
  min_words   int default 0,
  difficulty  text default 'intermediate',
  created_at  timestamptz default now()
);

-- ─── ANSWERS ──────────────────────────────────────
create table if not exists answers (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  question_id uuid references questions(id) on delete set null,
  exam_id     uuid references exams(id) on delete set null,
  content     text,
  audio_url   text,
  created_at  timestamptz default now()
);

-- ─── SCORES ───────────────────────────────────────
create table if not exists scores (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  exam_id    uuid references exams(id) on delete set null,
  score      numeric(3,1) not null check (score >= 1.0 and score <= 9.0),
  feedback   text,
  breakdown  jsonb,
  created_at timestamptz default now()
);

-- ─── SUBSCRIPTIONS ────────────────────────────────
create table if not exists subscriptions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  plan       text not null check (plan in ('free','pro','elite')) default 'free',
  status     text not null check (status in ('active','expired','cancelled')) default 'active',
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ─── PROFILES ─────────────────────────────────────
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  avatar_url      text,
  target_band     numeric(2,1) default 7.0,
  language        text default 'en',
  affiliate_code  text unique,
  referred_by     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── AUTO PROFILE + FREE SUB ON SIGNUP ───────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data->>'full_name');
  insert into public.subscriptions (user_id, plan, status)
    values (new.id, 'free', 'active');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── INDEXES ──────────────────────────────────────
create index if not exists idx_scores_user       on scores(user_id);
create index if not exists idx_answers_user      on answers(user_id);
create index if not exists idx_subscriptions     on subscriptions(user_id, status);
create index if not exists idx_questions_exam    on questions(exam_id);
