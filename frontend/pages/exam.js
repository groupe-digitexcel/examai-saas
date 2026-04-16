import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import AudioRecorder from '../components/AudioRecorder';
import Timer from '../components/Timer';
import { supabase, saveScore } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Brain, AlertTriangle } from 'lucide-react';

// Duration in seconds per exam type
const DURATIONS = { writing: 3600, speaking: 900, reading: 3600, listening: 1800 };

// Sample questions (in production, fetch from Supabase + AI generate)
const SAMPLE_QUESTIONS = {
  writing: [
    {
      id: 'w1', type: 'writing', exam_id: 'ielts-writing',
      question: 'The graph below shows the changes in the proportion of the population aged 65 and over in three countries from 1940 to 2040. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    },
    {
      id: 'w2', type: 'writing', exam_id: 'ielts-writing',
      question: 'Some people believe that university students should be required to attend classes. Others believe that attendance should be optional. Discuss both views and give your own opinion. Write at least 250 words.',
    },
  ],
  speaking: [
    {
      id: 's1', type: 'speaking', exam_id: 'ielts-speaking',
      question: 'Part 1: Tell me about your hometown. What is it like? What do you enjoy most about living there?',
    },
    {
      id: 's2', type: 'speaking', exam_id: 'ielts-speaking',
      question: 'Part 2: Describe a skill you have learned that you consider important. You should say: what the skill is, how you learned it, how difficult it was to learn, and explain why you consider it important.',
    },
  ],
  reading: [
    {
      id: 'r1', type: 'mcq', exam_id: 'ielts-reading',
      question: 'According to the passage, the main reason for the decline of coral reefs is:',
      options: [
        'Overfishing and destructive fishing practices',
        'Ocean warming and acidification due to climate change',
        'Pollution from coastal urban development',
        'Natural predation by crown-of-thorns starfish',
      ],
    },
    {
      id: 'r2', type: 'mcq', exam_id: 'ielts-reading',
      question: 'The word "resilience" in paragraph 3 most closely means:',
      options: ['Vulnerability', 'Adaptability', 'Instability', 'Rigidity'],
    },
  ],
  listening: [
    {
      id: 'l1', type: 'writing', exam_id: 'ielts-listening',
      question: 'Section 1: You will hear a conversation about booking a hotel room. Listen and write the answers. What is the guest\'s full name? (Write as heard)',
    },
  ],
};

export default function ExamPage() {
  const router = useRouter();
  const { type = 'writing' } = router.query;

  const [user,        setUser]        = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [current,     setCurrent]     = useState(0);
  const [answers,     setAnswers]     = useState([]);
  const [phase,       setPhase]       = useState('loading'); // loading | intro | exam | submitting | done
  const [result,      setResult]      = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
      setQuestions(SAMPLE_QUESTIONS[type] || SAMPLE_QUESTIONS.writing);
      setPhase('intro');
    });
  }, [type]);

  function startExam() { setPhase('exam'); }

  const handleAnswer = useCallback((ans) => {
    const newAnswers = [...answers, { questionId: questions[current].id, answer: ans }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
      } else {
        submitExam(newAnswers);
      }
    }, 1000);
  }, [answers, current, questions]);

  async function submitExam(finalAnswers) {
    setPhase('submitting');
    try {
      const response = await fetch('/api/ai-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          type,
          questions,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Scoring failed');

      // Save to Supabase
      const examId = questions[0]?.exam_id || 'ielts-' + type;
      await saveScore({
        userId:   user.id,
        examId,
        score:    data.band,
        feedback: data.feedback,
      });

      setResult(data);
      setPhase('done');
    } catch (err) {
      toast.error('Scoring failed: ' + err.message);
      setPhase('exam');
    }
  }

  function handleTimeUp() {
    toast('Time is up! Submitting your answers...', { icon: '⏱️' });
    submitExam(answers);
  }

  // ── RENDER ──────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{type.charAt(0).toUpperCase() + type.slice(1)} Test — ExamAI</title>
      </Head>
      <Navbar />

      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto mt-6 space-y-6">

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <div className="card space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
                  <Brain size={20} className="text-brand-400" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-white text-xl capitalize">{type} Test</h1>
                  <p className="text-white/40 text-sm font-body">IELTS-style AI simulation</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Questions',  value: questions.length },
                  { label: 'Time limit', value: `${DURATIONS[type] / 60} min` },
                  { label: 'Scored by',  value: 'Claude AI' },
                  { label: 'Band range', value: '1.0 – 9.0' },
                ].map((i, k) => (
                  <div key={k} className="bg-dark-700 rounded-xl p-3">
                    <p className="text-xs text-white/30 font-body">{i.label}</p>
                    <p className="text-white font-semibold font-display mt-0.5">{i.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-200/70 font-body">
                  Once you start, the timer begins. Make sure you have a stable internet connection
                  and, for speaking tests, microphone access enabled.
                </p>
              </div>
              <button onClick={startExam} className="btn-primary w-full">
                Start Test Now
              </button>
            </div>
          )}

          {/* ── EXAM ── */}
          {phase === 'exam' && (
            <>
              {/* Timer fixed at top */}
              <div className="flex items-center justify-between card py-3">
                <span className="text-sm font-body text-white/50 capitalize">{type} Test</span>
                <Timer duration={DURATIONS[type]} onExpire={handleTimeUp} />
              </div>

              <QuestionCard
                question={questions[current]}
                index={current}
                total={questions.length}
                onAnswer={handleAnswer}
                audioSlot={
                  questions[current]?.type === 'speaking'
                    ? <AudioRecorder questionId={questions[current].id} onRecordingComplete={handleAnswer} />
                    : null
                }
              />
            </>
          )}

          {/* ── SUBMITTING ── */}
          {phase === 'submitting' && (
            <div className="card text-center space-y-4 py-12 animate-pulse-slow">
              <div className="w-14 h-14 border-3 border-brand-500 border-t-transparent rounded-full
                              animate-spin mx-auto" style={{ borderWidth: 3 }} />
              <h2 className="font-display font-bold text-white text-xl">Evaluating Your Answers</h2>
              <p className="text-white/40 font-body text-sm">
                Our AI examiner is reviewing your responses using IELTS band descriptors...
              </p>
            </div>
          )}

          {/* ── DONE (preview) ── */}
          {phase === 'done' && result && (
            <div className="space-y-4 animate-slide-up">
              <div className="card text-center space-y-4 py-8">
                {/* Score ring */}
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8" className="stroke-dark-600" />
                    <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="314"
                      strokeDashoffset={314 * (1 - result.band / 9)}
                      className="stroke-brand-400 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-display text-white">{result.band}</span>
                    <span className="text-xs text-white/40 font-body">Band Score</span>
                  </div>
                </div>

                <div>
                  <h2 className="font-display font-bold text-white text-xl">Test Complete!</h2>
                  <p className="text-white/40 font-body text-sm mt-1">Your IELTS-style band score</p>
                </div>

                <div className="text-left bg-dark-700 rounded-xl p-4 text-sm font-body text-white/70 leading-relaxed whitespace-pre-wrap">
                  {result.feedback}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => router.push('/results')} className="btn-outline flex-1">View History</button>
                  <button onClick={() => router.push('/exam?type=' + type)} className="btn-primary flex-1">Try Again</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
