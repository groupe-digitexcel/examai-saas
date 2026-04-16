import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-white/40 font-body mb-1">{label}</p>
      <p className="text-brand-400 font-bold font-display text-lg">
        Band {payload[0]?.value?.toFixed(1)}
      </p>
    </div>
  );
}

export default function ScoreChart({ scores = [] }) {
  if (!scores.length) {
    return (
      <div className="h-48 flex items-center justify-center text-white/30 font-body text-sm">
        No score history yet. Take your first exam!
      </div>
    );
  }

  const data = scores.slice().reverse().map((s, i) => ({
    name:  new Date(s.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' }),
    score: parseFloat(s.score),
    exam:  s.exams?.title || 'Exam',
  }));

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false} tickLine={false} />
          <YAxis domain={[0, 9]}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={6.5} stroke="#1ea99e" strokeDasharray="4 4" strokeOpacity={0.4} label={{
            value: 'Target', position: 'insideTopRight',
            fill: '#1ea99e', fontSize: 10, fontFamily: 'Sora',
          }} />
          <Line
            type="monotone" dataKey="score"
            stroke="#1ea99e" strokeWidth={2.5}
            dot={{ r: 4, fill: '#1ea99e', strokeWidth: 2, stroke: '#050d0c' }}
            activeDot={{ r: 6, fill: '#38c4b8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
