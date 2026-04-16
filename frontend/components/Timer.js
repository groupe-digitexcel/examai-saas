import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Timer({ duration, onExpire }) {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    if (time <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [time, onExpire]);

  const mins    = Math.floor(time / 60);
  const secs    = time % 60;
  const pct     = time / duration;
  const radius  = 38;
  const circ    = 2 * Math.PI * radius;
  const offset  = circ * (1 - pct);

  const colorClass =
    pct > 0.5 ? 'text-brand-400 stroke-brand-400' :
    pct > 0.2 ? 'text-yellow-400 stroke-yellow-400' :
                'text-red-400 stroke-red-400 animate-pulse';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} fill="none"
            strokeWidth="5" className="stroke-dark-600" />
          <circle cx="44" cy="44" r={radius} fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className={`transition-all duration-1000 ${colorClass}`}
          />
        </svg>
        {/* Time text */}
        <div className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-lg ${colorClass}`}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
      </div>
      {pct <= 0.2 && time > 0 && (
        <div className="flex items-center gap-1 text-red-400 text-xs font-semibold animate-pulse">
          <AlertTriangle size={12} />
          Time running out!
        </div>
      )}
      {time === 0 && (
        <div className="text-red-400 text-xs font-semibold">Time's up!</div>
      )}
    </div>
  );
}
