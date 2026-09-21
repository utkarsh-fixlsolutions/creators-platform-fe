import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Image as ImageIcon,
  Video,
  Type,
  Radio,
  BarChart3,
  CalendarClock,
  ChevronLeft,
  Plus,
  Trash2,
} from 'lucide-react';
import { useStudioContentStore } from '../../store/studioContentStore';
import { Toast } from '../Toast';
import { cn } from '../../utils/cn';

type CreateKind = 'photo' | 'video' | 'text' | 'poll' | 'schedule';
type Visibility = 'free' | 'subscribers' | 'ppv';

interface Props {
  open: boolean;
  onClose: () => void;
}

const OPTIONS: { id: CreateKind | 'live'; title: string; subtitle: string; icon: typeof ImageIcon }[] = [
  { id: 'photo', title: 'Upload photos', subtitle: 'Share images with your fans', icon: ImageIcon },
  { id: 'video', title: 'Upload video', subtitle: 'Post a video from your device', icon: Video },
  { id: 'text', title: 'Create text post', subtitle: 'Share updates, thoughts or links', icon: Type },
  { id: 'live', title: 'Go live', subtitle: 'Start a live stream', icon: Radio },
  { id: 'poll', title: 'Create poll', subtitle: 'Engage your audience', icon: BarChart3 },
  { id: 'schedule', title: 'Schedule post', subtitle: 'Plan for later', icon: CalendarClock },
];

export function CreateSheet({ open, onClose }: Props) {
  const navigate = useNavigate();
  const addContent = useStudioContentStore((s) => s.addContent);

  const [kind, setKind] = useState<CreateKind | null>(null);
  const [caption, setCaption] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('free');
  const [price, setPrice] = useState('9.99');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [scheduleAt, setScheduleAt] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setKind(null);
      setCaption('');
      setMediaPreview(null);
      setVisibility('free');
      setPrice('9.99');
      setPollQuestion('');
      setPollOptions(['', '']);
      setScheduleAt('');
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const handleSelect = (id: CreateKind | 'live') => {
    if (id === 'live') {
      onClose();
      navigate('/studio/live');
      return;
    }
    setKind(id);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaPreview(URL.createObjectURL(f));
    e.target.value = '';
  };

  const canPublish =
    kind === 'poll'
      ? pollQuestion.trim().length > 0 && pollOptions.filter((o) => o.trim()).length >= 2
      : caption.trim().length > 0 || !!mediaPreview;

  const statusFor = (): 'published' | 'subscribers' | 'draft' =>
    kind === 'schedule' ? 'draft' : visibility === 'subscribers' ? 'subscribers' : 'published';

  const metaFor = (type: 'image' | 'video' | 'text') => {
    if (type === 'video') return mediaPreview ? '0:00' : 'Video';
    if (type === 'image') return '1 image';
    return 'Text post';
  };

  const handlePublish = () => {
    if (!canPublish) return;

    if (kind === 'poll') {
      addContent({
        title: `Poll: ${pollQuestion.trim()}`,
        type: 'text',
        meta: `${pollOptions.filter((o) => o.trim()).length} options`,
        status: 'published',
      });
      notify('Poll published to your feed 📊');
    } else {
      const type = kind === 'video' ? 'video' : kind === 'photo' ? 'image' : 'text';
      addContent({
        title: caption.trim() || 'Untitled post',
        type,
        thumbnail: mediaPreview || undefined,
        meta: metaFor(type),
        status: statusFor(),
        price: visibility === 'ppv' ? Number(price) : undefined,
      });
      notify(kind === 'schedule' ? `Post scheduled for ${scheduleAt || 'later'} 🗓️` : 'Published to your Content page ✨');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full sm:max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-line bg-surface shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-2">
            {kind && (
              <button
                type="button"
                onClick={() => setKind(null)}
                aria-label="Back"
                className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-lg font-bold text-ink tracking-tight">
              {kind ? OPTIONS.find((o) => o.id === kind)?.title : 'Create'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Menu step */}
        {!kind && (
          <div className="p-3">
            {OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className="flex w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-left hover:bg-paper transition-colors cursor-pointer"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{opt.title}</p>
                    <p className="text-xs text-muted truncate">{opt.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Composer step */}
        {kind && kind !== 'poll' && (
          <div className="p-5 space-y-4">
            {(kind === 'photo' || kind === 'video') && (
              <div>
                <input ref={fileRef} type="file" accept={kind === 'photo' ? 'image/*' : 'video/*'} className="hidden" onChange={handleFile} />
                {mediaPreview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-line">
                    <img src={mediaPreview} alt="Preview" className="w-full h-44 object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaPreview(null)}
                      className="absolute top-2 right-2 rounded-full bg-ink/70 p-1.5 text-white cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong text-muted hover:border-brand/40 hover:text-brand transition-colors cursor-pointer"
                  >
                    {kind === 'photo' ? <ImageIcon className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                    <span className="text-xs font-semibold">Tap to select a {kind}</span>
                  </button>
                )}
              </div>
            )}

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-line bg-paper/60 px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand/40 focus:bg-surface focus:ring-2 focus:ring-brand/10"
            />

            {kind === 'schedule' && (
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-brand/40 focus:bg-surface"
              />
            )}

            {/* Visibility selector */}
            <div className="flex gap-2">
              {(['free', 'subscribers', 'ppv'] as Visibility[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={cn(
                    'flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer',
                    visibility === v ? 'bg-ink text-white border-ink' : 'border-line text-muted hover:border-line-strong hover:text-ink'
                  )}
                >
                  {v === 'free' ? 'Free' : v === 'subscribers' ? 'Subscribers only' : 'Pay-per-view'}
                </button>
              ))}
            </div>

            {visibility === 'ppv' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">$</span>
                <input
                  type="number"
                  min="0.99"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-24 rounded-xl border border-line bg-paper/60 px-3 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:bg-surface"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish}
              className={cn(
                'w-full rounded-2xl py-3 text-sm font-bold transition-all cursor-pointer',
                canPublish ? 'bg-ink text-white hover:bg-brand shadow-2xs' : 'bg-paper text-muted/50 cursor-not-allowed'
              )}
            >
              {kind === 'schedule' ? 'Schedule post' : 'Publish'}
            </button>
          </div>
        )}

        {/* Poll composer */}
        {kind === 'poll' && (
          <div className="p-5 space-y-4">
            <input
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask your fans something..."
              className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand/40 focus:bg-surface focus:ring-2 focus:ring-brand/10"
            />

            <div className="space-y-2">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={opt}
                    onChange={(e) =>
                      setPollOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))
                    }
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-brand/40 focus:bg-surface"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions((prev) => prev.filter((_, idx) => idx !== i))}
                      className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-rose-soft hover:text-rose cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions((prev) => [...prev, ''])}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add option
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish}
              className={cn(
                'w-full rounded-2xl py-3 text-sm font-bold transition-all cursor-pointer',
                canPublish ? 'bg-ink text-white hover:bg-brand shadow-2xs' : 'bg-paper text-muted/50 cursor-not-allowed'
              )}
            >
              Publish poll
            </button>
          </div>
        )}
      </div>

      <Toast message={toast} />
    </div>
  );
}
