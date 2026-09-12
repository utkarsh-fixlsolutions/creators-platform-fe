import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle, Radio, Sparkles } from "lucide-react";
import { CREATORS, type LiveRoom } from "../../data";
import { useLiveStore } from "../../store/liveStore";
import { LiveOverlayChrome } from "../../components/live/LiveOverlayChrome";
import { LiveChatOverlay } from "../../components/live/LiveChatOverlay";
import { ReactionRail } from "../../components/live/ReactionRail";
import { TipRow } from "../../components/live/TipRow";
import { LiveComposer } from "../../components/live/LiveComposer";
import { SubscriberGate } from "../../components/live/SubscriberGate";
import { TicketSheet } from "../../components/live/TicketSheet";
import { Toast } from "../../components/Toast";

export function LiveRoomPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const {
    activeRoom,
    setActiveRoomById,
    chat,
    bursts,
    selectedTip,
    setSelectedTip,
    sendMessage,
    react,
    sendTip,
    claimTicket,
    subscribe,
    toggleEntitlement,
  } = useLiveStore();

  useEffect(() => {
    if (handle) {
      setActiveRoomById(handle);
    }
  }, [handle, setActiveRoomById]);

  const room: LiveRoom = activeRoom || useLiveStore.getState().featuredRoom;
  const creator = CREATORS.find((c) => c.id === room.creatorId);
  const creatorName = creator?.name || "Theo Marchetti";

  const handleBack = () => {
    navigate("/live");
  };

  const handleSubscribe = () => {
    const success = subscribe(room.creatorId);
    if (success) {
      notify(`Subscribed to ${creatorName}! Welcome to the room.`);
    } else {
      notify("Insufficient Coins balance. Please top up your wallet.");
    }
  };

  const handleClaimTicket = () => {
    const success = claimTicket(room.id);
    if (success) {
      notify("You're in — enjoy the show!");
    } else {
      notify("Insufficient Coins balance to purchase ticket.");
    }
  };

  const handleSendTip = (amount: number) => {
    const success = sendTip(amount, creatorName);
    if (success) {
      notify(`Sent ${amount} Coins tip to ${creatorName}!`);
      react("✨");
    } else {
      notify("Insufficient Coins balance for tip.");
    }
  };

  // State 1: Subscribers Gate
  if (room.access === "subscribers" && !room.viewerIsEntitled) {
    return (
      <div className="relative h-[100dvh] w-full bg-[#121218] text-ink overflow-hidden">
        <SubscriberGate
          room={room}
          onBack={handleBack}
          onSubscribe={handleSubscribe}
        />
        <Toast message={toast} />
      </div>
    );
  }

  // State 2: Ticketed Show Gate
  if (room.access === "ticketed" && !room.viewerIsEntitled) {
    return (
      <div className="relative h-[100dvh] w-full bg-[#121218] text-ink overflow-hidden">
        <TicketSheet
          room={room}
          onClose={handleBack}
          onPurchase={handleClaimTicket}
        />
        <Toast message={toast} />
      </div>
    );
  }

  // State 3: Entitled Live Viewer Screen (Mobile full bleed + Desktop theatre layout)
  const poster =
    room.streamPoster ||
    room.coverImage ||
    "https://images.pexels.com/photos/14807440/pexels-photo-14807440.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&h=1600";

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#121218] text-ink overflow-hidden md:bg-paper md:py-6 md:px-6 lg:px-12 flex flex-col justify-center">
      {/* DESKTOP THEATRE CONTAINER */}
      <div className="mx-auto w-full max-w-[1240px] md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] md:gap-6 md:items-start">
        {/* MAIN VIDEO PLAYER / STREAM SURFACE */}
        <div className="relative h-[100dvh] md:h-[660px] lg:h-[720px] w-full overflow-hidden md:rounded-[28px] md:border md:border-line-strong md:shadow-pop bg-[#1a1a22]">
          {/* Simulated Video Stream Layer */}
          <div
            className="absolute inset-0 bg-[#24242b] bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url("${poster}")`,
            }}
          />

          {/* Scrim Overlay */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/10 to-ink/75"
          />

          {/* Top Floating White/Paper Chrome */}
          <LiveOverlayChrome
            room={room}
            onBack={handleBack}
            onToggleEntitlement={() => toggleEntitlement(room.id)}
            onNotify={notify}
          />

          {/* Mobile Overlay Chat and Floating Reaction Bursts */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-3 pb-4 sm:p-4 md:hidden">
            {/* Reaction Rail & Chat Area */}
            <div className="flex items-end justify-between gap-3 mb-2.5">
              {/* Rolling 4-message chat bubble overlay */}
              <div className="flex-1 min-w-0">
                <LiveChatOverlay messages={chat} />
              </div>

              {/* Vertical Reaction Emoji Rail */}
              <div className="pointer-events-auto shrink-0">
                <ReactionRail bursts={bursts} onReact={react} />
              </div>
            </div>

            {/* Quick Coin Tip Row */}
            <div className="pointer-events-auto mb-2">
              <TipRow
                selectedAmount={selectedTip}
                onSelect={(amount) => setSelectedTip(amount)}
                onConfirm={handleSendTip}
              />
            </div>

            {/* Bottom Composer Dock */}
            <div className="pointer-events-auto">
              <LiveComposer
                creatorName={creatorName}
                onSend={sendMessage}
                onOpenGift={() => handleSendTip(selectedTip || 120)}
              />
            </div>
          </div>

          {/* Desktop Overlay Reaction Rail (inside player) */}
          <div className="hidden md:flex absolute right-4 bottom-20 z-20">
            <ReactionRail bursts={bursts} onReact={react} />
          </div>

          {/* Desktop Overlay Quick Tips Bar */}
          <div className="hidden md:flex absolute left-4 bottom-4 z-20 items-center gap-3">
            <TipRow
              selectedAmount={selectedTip}
              onSelect={(amount) => setSelectedTip(amount)}
              onConfirm={handleSendTip}
            />
          </div>
        </div>

        {/* DESKTOP RIGHT CHAT COLUMN */}
        <div className="hidden md:flex md:flex-col h-[660px] lg:h-[720px] rounded-[28px] border border-line bg-surface shadow-card overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-paper/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-rose stroke-[2.2] animate-pulse" />
              <span className="font-bold text-[14px] text-ink">Live Room Chat</span>
            </div>
            <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-muted border border-line">
              {room.viewers.toLocaleString()} watching
            </span>
          </div>

          {/* Chat Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 quiet-scroll">
            {chat.map((msg) => (
              <div
                key={msg.id}
                className={`animate-chat-in flex items-start gap-2.5 rounded-2xl p-2.5 transition-colors ${
                  msg.isSystem
                    ? "bg-gold-soft/80 border border-[#e9d6ab]"
                    : msg.isSubscriber
                    ? "bg-paper/70 hover:bg-paper"
                    : "hover:bg-paper/50"
                }`}
              >
                {msg.avatar && (
                  <span
                    className="h-7 w-7 shrink-0 rounded-full border border-line bg-paper-deep"
                    style={{
                      backgroundImage: `url("${msg.avatar}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}
                <div className="min-w-0 flex-1 text-[13px] leading-snug text-ink-soft">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-ink">{msg.handle}</span>
                    {msg.isSubscriber && !msg.isSystem && (
                      <span className="rounded-full bg-gold-soft px-1.5 py-[1px] text-[9.5px] font-extrabold tracking-[0.05em] text-gold-deep">
                        SUB
                      </span>
                    )}
                  </div>
                  <p className={msg.isSystem ? "font-semibold text-gold-deep mt-0.5" : "text-ink-soft mt-0.5"}>
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Chat Composer */}
          <div className="border-t border-line p-3.5 bg-paper/40">
            <LiveComposer
              creatorName={creatorName}
              onSend={sendMessage}
              onOpenGift={() => handleSendTip(selectedTip || 120)}
            />
          </div>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
