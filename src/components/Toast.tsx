import { Check } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 flex justify-center md:bottom-8"
    >
      {message && (
        <div
          key={message}
          className="pointer-events-auto absolute bottom-0 left-1/2 flex animate-toast items-center gap-2.5 whitespace-nowrap rounded-full bg-ink py-2.5 pl-3 pr-5 text-sm font-medium text-white shadow-pop"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          {message}
        </div>
      )}
    </div>
  );
}
