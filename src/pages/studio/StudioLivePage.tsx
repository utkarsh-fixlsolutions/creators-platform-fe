import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, Radio, Users, Gem, Square, ArrowLeft, Trophy, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

type Stage = 'preflight' | 'live' | 'summary';
type Mode = 'standard' | 'pk' | 'party';

const MODES: { id: Mode; label: string }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'pk', label: 'PK Battle' },
  { id: 'party', label: 'Party Room' },
];

const GIFT_EVENTS = [
  'sophia.k sent a Rose 🌹',
  'liam.t sent 50 Coins 💎',
  'alex.rivera sent a Crown 👑',
  'priya.verma sent a Heart ❤️',
];

export function StudioLivePage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('preflight');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<Mode>('standard');
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const [viewers, setViewers] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);
  const [giftRevenue, setGiftRevenue] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [feed, setFeed] = useState<string[]>([]);

  const tickRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (stage !== 'live') return;
    tickRef.current = window.setInterval(() => {
      setElapsed((s) => s + 1);
      setViewers((v) => {
        const next = Math.max(1, v + Math.round(Math.random() * 6 - 2));
        setPeakViewers((p) => Math.max(p, next));
        return next;
      });
      if (Math.random() > 0.6) {
        const gift = GIFT_EVENTS[Math.floor(Math.random() * GIFT_EVENTS.length)];
        setFeed((f) => [gift, ...f].slice(0, 6));
        setGiftRevenue((r) => r + Math.round(Math.random() * 15 + 5));
      }
    }, 1200);
    return () => window.clearInterval(tickRef.current);
  }, [stage]);

  const startBroadcast = () => {
    setViewers(1);
    setPeakViewers(1);
    setElapsed(0);
    setGiftRevenue(0);
    setFeed([]);
    setStage('live');
  };

  const endBroadcast = () => {
    window.clearInterval(tickRef.current);
    setStage('summary');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (stage === 'summary') {
    return (
      <div className="max-w-md mx-auto space-y-5 text-center py-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand">
          <Trophy className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink">Broadcast ended</h1>
          <p className="text-sm text-muted mt-1">Nice stream! Here's how it went.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-lg font-bold text-ink">{peakViewers}</p>
            <p className="text-[11px] text-muted">Peak viewers</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-lg font-bold text-ink">${giftRevenue}</p>
            <p className="text-[11px] text-muted">Gift revenue</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-lg font-bold text-ink">{fmt(elapsed)}</p>
            <p className="text-[11px] text-muted">Duration</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/studio')}
          className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-brand transition-colors cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (stage === 'live') {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[24px] bg-ink aspect-video flex items-center justify-center">
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-rose px-3 py-1 text-xs font-bold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <Users className="h-3.5 w-3.5" /> {viewers}
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <Clock className="h-3.5 w-3.5" /> {fmt(elapsed)}
          </div>
          <Camera className="h-10 w-10 text-white/30" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-xs font-bold text-gold-deep">
              <Gem className="h-3.5 w-3.5" /> ${giftRevenue} in gifts
            </span>
          </div>
          <button
            type="button"
            onClick={endBroadcast}
            className="flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-xs font-bold text-white hover:bg-rose/90 transition-colors cursor-pointer"
          >
            <Square className="h-3.5 w-3.5 fill-current" /> End broadcast
          </button>
        </div>

        <section className="rounded-[24px] border border-line bg-surface p-4 shadow-sm">
          <h2 className="text-sm font-bold text-ink mb-2.5">Live activity</h2>
          <div className="space-y-1.5 min-h-[80px]">
            {feed.length === 0 ? (
              <p className="text-xs text-muted">Gifts and reactions will appear here as they come in...</p>
            ) : (
              feed.map((f, i) => (
                <p key={i} className="text-xs text-ink-soft animate-fade-in">
                  {f}
                </p>
              ))
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <button
        type="button"
        onClick={() => navigate('/studio')}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div>
        <h1 className="text-xl font-bold text-ink">Go live</h1>
        <p className="text-sm text-muted mt-0.5">Set up your broadcast before you start.</p>
      </div>

      {/* Preflight checks */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setCamOn((v) => !v)}
          className={cn(
            'flex-1 flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all cursor-pointer',
            camOn ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-line bg-surface text-muted'
          )}
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs font-semibold">{camOn ? 'Camera ready' : 'Camera off'}</span>
        </button>
        <button
          type="button"
          onClick={() => setMicOn((v) => !v)}
          className={cn(
            'flex-1 flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all cursor-pointer',
            micOn ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-line bg-surface text-muted'
          )}
        >
          <Mic className="h-5 w-5" />
          <span className="text-xs font-semibold">{micOn ? 'Mic ready' : 'Mic off'}</span>
        </button>
      </div>

      <div>
        <label className="text-[11px] font-semibold text-muted uppercase tracking-wide">Stream title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you streaming today?"
          className="mt-1 w-full rounded-2xl border border-line bg-paper/60 px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand/40 focus:bg-surface focus:ring-2 focus:ring-brand/10"
        />
      </div>

      <div>
        <label className="text-[11px] font-semibold text-muted uppercase tracking-wide">Mode</label>
        <div className="mt-1.5 flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                'flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer',
                mode === m.id ? 'bg-ink text-white border-ink' : 'border-line text-muted hover:border-line-strong hover:text-ink'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={startBroadcast}
        disabled={!camOn || !micOn}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all cursor-pointer',
          camOn && micOn ? 'bg-rose text-white hover:bg-rose/90 shadow-2xs' : 'bg-paper text-muted/50 cursor-not-allowed'
        )}
      >
        <Radio className="h-4 w-4" /> Start broadcast
      </button>
    </div>
  );
}
