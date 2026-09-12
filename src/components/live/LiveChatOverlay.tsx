import type { LiveChatMessage } from "../../data";

interface LiveChatOverlayProps {
  messages: LiveChatMessage[];
}

export function LiveChatOverlay({ messages }: LiveChatOverlayProps) {
  // Cap at max 4 visible messages for the floating overlay
  const visible = messages.slice(-4);

  return (
    <div className="pointer-events-none flex flex-col items-start gap-2 max-w-full">
      {visible.map((msg) => {
        const isSub = msg.isSubscriber;
        const isSystem = msg.isSystem;

        let bgClass = "bg-white/82";
        if (isSystem) {
          bgClass = "bg-gold-soft/95 border border-[#e9d6ab]";
        } else if (isSub) {
          bgClass = "bg-white/94";
        }

        return (
          <div
            key={msg.id}
            className={`animate-chat-in max-w-full flex items-start gap-2 rounded-[18px] py-1.5 pl-2 pr-3 shadow-[0_6px_20px_-10px_rgba(18,18,24,0.45)] backdrop-blur-[10px] ${bgClass}`}
          >
            {msg.avatar && (
              <span
                className="mt-0.5 h-[22px] w-[22px] shrink-0 rounded-full bg-paper-deep shadow-xs"
                style={{
                  backgroundImage: `url("${msg.avatar}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div className="min-w-0 text-[12.5px] leading-[1.38] text-ink-soft text-pretty">
              <span className="font-bold text-ink">{msg.handle}</span>
              {isSub && !isSystem && (
                <span className="mx-1 inline-block rounded-full bg-gold-soft px-1.5 py-[1px] text-[9.5px] font-extrabold tracking-[0.05em] text-gold-deep align-[1px]">
                  SUB
                </span>
              )}
              <span className={isSystem ? "font-semibold text-gold-deep" : "text-ink-soft"}>
                {" "}
                {msg.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
