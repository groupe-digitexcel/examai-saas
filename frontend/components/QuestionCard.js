import { useState } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

/**
 * QuestionCard supports three question types:
 *   writing   – textarea answer
 *   mcq       – multiple choice (options array required)
 *   speaking  – triggers AudioRecorder (passed as slot)
 */
export default function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  audioSlot = null,   // pass <AudioRecorder /> from parent for speaking type
}) {
  const [answer,   setAnswer]   = useState('');
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!answer.trim() && selected === null) return;
    const ans = question.type === 'mcq' ? question.options[selected] : answer;
    setSubmitted(true);
    onAnswer?.(ans);
  }

  return (
    <div className="card space-y-5 animate-slide-up">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/40 font-body">
          Question <span className="text-brand-400 font-semibold">{index + 1}</span> / {total}
        </span>
        <span className="badge badge-green">{question.type?.toUpperCase()}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question text */}
      <div>
        <p className="text-white font-body text-base leading-relaxed">{question.question || question.text}</p>
        {question.passage && (
          <div className="mt-3 p-4 bg-dark-700 rounded-xl border-l-4 border-brand-500/60
                          text-white/70 text-sm leading-relaxed font-body italic">
            {question.passage}
          </div>
        )}
      </div>

      {/* Answer section */}
      {question.type === 'mcq' && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              disabled={submitted}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150
                font-body text-sm ${selected === i
                  ? 'bg-brand-500/20 border-brand-500 text-white'
                  : 'bg-dark-700 border-dark-600 text-white/70 hover:border-brand-500/40'
                } ${submitted ? 'cursor-default' : ''}`}
            >
              <span className="font-semibold text-brand-400 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === 'writing' && (
        <textarea
          className="textarea-field min-h-[140px]"
          placeholder="Write your answer here..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={submitted}
          rows={6}
        />
      )}

      {question.type === 'speaking' && audioSlot}

      {/* Word count for writing */}
      {question.type === 'writing' && (
        <p className="text-xs text-white/30 font-body text-right">
          {answer.trim().split(/\s+/).filter(Boolean).length} words
        </p>
      )}

      {/* Submit */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={question.type === 'mcq' ? selected === null : !answer.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Submit Answer <ChevronRight size={16} />
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-brand-400 font-semibold font-display py-2">
          <CheckCircle2 size={18} />
          Answer submitted — Loading next...
        </div>
      )}
    </div>
  );
}
