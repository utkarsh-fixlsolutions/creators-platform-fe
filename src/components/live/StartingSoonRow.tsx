import { useState } from "react";
import { Bell, Check } from "lucide-react";

interface StartingSoonRowProps {
  title?: string;
  subtitle?: string;
  onNotify?: (message: string) => void;
}

export function StartingSoonRow({
  title = "Starting soon · Noor, 9:00pm",
  subtitle = "Ticketed show · 120 Coins",
  onNotify,
}: StartingSoonRowProps) {
  const [notified, setNotified] = useState(false);

  const handleClick = () => {
    setNotified((prev) => {
      const next = !prev;
      if (next) {
        onNotify?.("Reminder set! We'll notify you the moment Noor goes live.");
      } else {
        onNotify?.("Reminder removed.");
      }
      return next;
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-line bg-surface p-3.5 shadow-card sm:p-4 transition-all duration-200 hover:shadow-card-hover">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-soft text-gold-deep">
        <Bell className="h-[19px] w-[19px] stroke-[2.1]" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-bold text-ink">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-muted">
          {subtitle}
        </span>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-bold transition-all duration-200 active:scale-95 ${
          notified
            ? "border-brand bg-brand text-white shadow-brand"
            : "border-line bg-paper text-ink hover:bg-paper-deep"
        }`}
      >
        {notified ? (
          <>
            <Check className="h-3.5 w-3.5 stroke-[2.4]" />
            <span>Reminded</span>
          </>
        ) : (
          "Notify me"
        )}
      </button>
    </div>
  );
}
