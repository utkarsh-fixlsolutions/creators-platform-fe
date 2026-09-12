import { useState, type FormEvent } from "react";
import { Gift, Send } from "lucide-react";

interface LiveComposerProps {
  creatorName?: string;
  onSend: (text: string) => void;
  onOpenGift?: () => void;
}

export function LiveComposer({
  creatorName = "Creator",
  onSend,
  onOpenGift,
}: LiveComposerProps) {
  const [text, setText] = useState("");
  const firstName = creatorName.split(" ")[0];

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      {/* Input Pill */}
      <div className="flex h-[46px] min-w-0 flex-1 items-center gap-2 rounded-full bg-white/94 pl-4 pr-1.5 shadow-[0_10px_30px_-12px_rgba(18,18,24,0.5)] backdrop-blur-[12px] focus-within:ring-2 focus-within:ring-brand/30 transition-all">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Say something to ${firstName}…`}
          aria-label="Live chat message"
          className="flex-1 min-w-0 border-0 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!text.trim()}
          className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-ink text-white shadow-ink transition-all duration-150 hover:bg-black active:scale-95 disabled:opacity-40 disabled:hover:bg-ink cursor-pointer"
        >
          <Send className="h-4 w-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Gold Gift Button */}
      <button
        type="button"
        onClick={onOpenGift}
        aria-label="Send gift or tip"
        className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-gold text-white shadow-[0_12px_30px_-12px_rgba(184,121,28,0.9)] transition-all duration-200 hover:brightness-110 active:scale-95 cursor-pointer"
      >
        <Gift className="h-5 w-5 stroke-[2.2]" />
      </button>
    </form>
  );
}
