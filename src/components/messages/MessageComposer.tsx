import { useEffect, useRef, useState } from 'react';
import { Paperclip, Gem, Mic, Send, X, Square } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  handle: string;
  onSend: (text: string, imageUrl?: string) => void;
  onSendVoice: (duration: number) => void;
  onTip: () => void;
}

export default function MessageComposer({ handle, onSend, onSendVoice, onTip }: Props) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!recording) return;
    setRecSeconds(0);
    const id = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const canSend = text.trim().length > 0 || !!image;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim(), image || undefined);
    setText('');
    setImage(null);
    inputRef.current?.focus();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(URL.createObjectURL(f));
    e.target.value = '';
  };

  const stopRecording = (send: boolean) => {
    setRecording(false);
    if (send && recSeconds > 0) onSendVoice(recSeconds);
  };

  return (
    <div className="border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-md md:px-6">
      {/* Attached Image Preview */}
      {image && (
        <div className="mb-2.5 inline-flex items-start gap-2 rounded-2xl border border-line bg-paper p-2 shadow-sm">
          <img src={image} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => setImage(null)}
            className="rounded-full bg-surface p-1 text-muted hover:text-ink shadow-sm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Voice Recording Active Bar */}
      {recording ? (
        <div className="flex items-center gap-3 rounded-full border border-rose/30 bg-rose-50/60 px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose animate-ping" />
          <span className="text-xs font-bold text-rose">
            Recording · 0:{String(recSeconds).padStart(2, '0')}
          </span>

          <div className="flex flex-1 items-center gap-[2.5px] px-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="w-[2.5px] rounded-full bg-rose transition-all duration-150"
                style={{
                  height: `${6 + ((i * 7 + recSeconds * 4) % 18)}px`,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => stopRecording(false)}
            className="rounded-full p-1.5 text-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => stopRecording(true)}
            className="flex items-center gap-1.5 rounded-full bg-rose px-3.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-rose/90 transition-all active:scale-95"
          >
            <Square className="h-3 w-3 fill-current" /> Send
          </button>
        </div>
      ) : (
        /* Standard Composer Bar */
        <div className="flex items-end gap-2">
          <div className="flex flex-1 items-end gap-1.5 rounded-3xl border border-line bg-paper/60 px-2.5 py-1.5 transition-all focus-within:border-brand/40 focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand/10">
            {/* Attachment input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Attach photo"
              className="rounded-full p-2 text-muted hover:bg-paper hover:text-ink active:scale-95 transition-colors"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Tip shortcut */}
            <button
              type="button"
              onClick={onTip}
              aria-label="Send coin tip"
              className="rounded-full p-2 text-muted hover:bg-paper hover:text-gold active:scale-95 transition-colors"
            >
              <Gem className="h-4 w-4 text-gold" />
            </button>

            {/* Input textarea */}
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={`Message ${handle}...`}
              className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[13.5px] text-ink outline-none placeholder:text-muted"
            />

            {/* Mic trigger */}
            <button
              type="button"
              onClick={() => setRecording(true)}
              aria-label="Record voice note"
              className="rounded-full p-2 text-muted hover:bg-paper hover:text-ink active:scale-95 transition-colors"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>

          {/* Send Action Button */}
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95',
              canSend
                ? 'bg-brand text-white shadow-sm hover:bg-brand-deep'
                : 'bg-paper text-muted/50 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}
