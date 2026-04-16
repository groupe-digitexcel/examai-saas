import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AudioRecorder({ onRecordingComplete, questionId }) {
  const [status,   setStatus]   = useState('idle');   // idle | recording | recorded | uploading | done | error
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing,  setPlaying]  = useState(false);
  const [error,    setError]    = useState('');

  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const blobRef     = useRef(null);
  const audioElRef  = useRef(null);
  const timerRef    = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    mediaRef.current?.stream?.getTracks().forEach(t => t.stop());
  }, []);

  async function startRecording() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        setStatus('recorded');
        stream.getTracks().forEach(t => t.stop());
      };

      rec.start(250);
      setStatus('recording');
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone in browser settings.');
      setStatus('error');
    }
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    mediaRef.current?.stop();
  }

  function togglePlay() {
    if (!audioElRef.current) return;
    if (playing) {
      audioElRef.current.pause();
    } else {
      audioElRef.current.play();
    }
    setPlaying(!playing);
  }

  async function uploadAudio() {
    if (!blobRef.current) return;
    setStatus('uploading');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `audio/${user.id}/${questionId}-${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('exam-audio')
        .upload(fileName, blobRef.current, { contentType: 'audio/webm', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('exam-audio').getPublicUrl(fileName);

      setStatus('done');
      onRecordingComplete?.(publicUrl);
    } catch (err) {
      setError('Upload failed: ' + err.message);
      setStatus('error');
    }
  }

  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="bg-dark-700 rounded-2xl p-5 border border-dark-600 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold font-display text-white/70">
        <Mic size={16} className="text-brand-400" />
        Speaking Test — Audio Recorder
      </div>

      {/* Waveform / status visual */}
      <div className={`h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
        status === 'recording' ? 'bg-red-500/10 border border-red-500/30' : 'bg-dark-600'
      }`}>
        {status === 'recording' ? (
          <div className="flex items-center gap-1">
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 28}px`,
                  animationDelay: `${i * 80}ms`,
                  animationDuration: `${600 + Math.random() * 400}ms`,
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-white/30 text-sm font-body">
            {status === 'idle'      ? 'Press record to start speaking' :
             status === 'recorded'  ? 'Recording ready — play or upload' :
             status === 'uploading' ? 'Uploading audio...' :
             status === 'done'      ? 'Audio uploaded successfully!' : ''}
          </span>
        )}
      </div>

      {/* Timer */}
      {(status === 'recording' || status === 'recorded') && (
        <div className="text-center font-mono text-brand-400 font-semibold">{fmtTime(duration)}</div>
      )}

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio ref={audioElRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        {status === 'idle' && (
          <button onClick={startRecording} className="btn-primary flex items-center gap-2 flex-1">
            <Mic size={16} /> Start Recording
          </button>
        )}

        {status === 'recording' && (
          <button onClick={stopRecording}
            className="w-full bg-red-500 hover:bg-red-400 text-white font-semibold px-6 py-3
                       rounded-xl transition-all flex items-center justify-center gap-2 font-display">
            <Square size={16} /> Stop Recording
          </button>
        )}

        {status === 'recorded' && (
          <>
            <button onClick={togglePlay} className="btn-outline flex items-center gap-2">
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button onClick={startRecording} className="btn-ghost text-sm">Re-record</button>
            <button onClick={uploadAudio} className="btn-primary flex items-center gap-2 flex-1 justify-center">
              <Upload size={16} /> Submit Audio
            </button>
          </>
        )}

        {status === 'uploading' && (
          <div className="w-full flex items-center justify-center gap-2 text-brand-400 font-body text-sm py-2">
            <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            Uploading...
          </div>
        )}

        {status === 'done' && (
          <div className="w-full flex items-center justify-center gap-2 text-brand-400 font-semibold font-display">
            <CheckCircle2 size={18} /> Audio submitted!
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-400 text-sm font-body bg-red-500/10
                        border border-red-500/20 rounded-xl p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
