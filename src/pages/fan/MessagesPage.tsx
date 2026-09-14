import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Images, Lock, X, Gem } from 'lucide-react';
import ConversationList from '../../components/messages/ConversationList';
import ChatHeader from '../../components/messages/ChatHeader';
import ChatStream from '../../components/messages/ChatStream';
import MessageComposer from '../../components/messages/MessageComposer';
import TipModal from '../../components/messages/TipModal';
import { Sidebar, type NavItem } from '../../components/Sidebar';
import { MobileBottomNav, MobileTopBar } from '../../components/MobileChrome';
import { Toast } from '../../components/Toast';
import {
  initialConversations,
  creatorReplies,
  coinBalance as defaultCoins,
  type Conversation,
  type Message,
} from '../../data/messagesData';
import { cn } from '../../utils/cn';

const now = () =>
  new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
let uid = 5000;
const nid = () => `msg-${uid++}`;

export function MessagesPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 'c1' : null
  );
  const [balance, setBalance] = useState<number>(defaultCoins);
  const [typing, setTyping] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const replyIdx = useRef<Record<string, number>>({});
  const timers = useRef<number[]>([]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const updateConv = useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const select = (id: string) => {
    setActiveId(id);
    setVaultOpen(false);
    setTyping(false);
    updateConv(id, (c) => ({ ...c, unread: 0 }));
  };

  const pushMessage = (convId: string, m: Message) => {
    updateConv(convId, (c) => ({
      ...c,
      messages: [...c.messages, m],
      lastTime: 'Just now',
    }));
  };

  const triggerReply = (convId: string, creatorId: string) => {
    const t1 = window.setTimeout(() => setTyping(true), 700);
    const t2 = window.setTimeout(() => {
      setTyping(false);
      const pool = creatorReplies[creatorId] ?? ['Thank you for reaching out! ✨'];
      const i = replyIdx.current[creatorId] ?? 0;
      replyIdx.current[creatorId] = i + 1;
      pushMessage(convId, {
        id: nid(),
        sender: 'creator',
        type: 'text',
        text: pool[i % pool.length],
        time: now(),
      });
    }, 2200 + Math.random() * 500);
    timers.current.push(t1, t2);
  };

  const send = (text: string, imageUrl?: string) => {
    if (!active) return;
    if (imageUrl) {
      pushMessage(active.id, {
        id: nid(),
        sender: 'fan',
        type: 'image',
        mediaUrl: imageUrl,
        time: now(),
      });
    }
    if (text) {
      pushMessage(active.id, {
        id: nid(),
        sender: 'fan',
        type: 'text',
        text,
        time: now(),
      });
    }
    triggerReply(active.id, active.creator.id);
  };

  const sendVoice = (duration: number) => {
    if (!active) return;
    pushMessage(active.id, {
      id: nid(),
      sender: 'fan',
      type: 'voice',
      duration,
      time: now(),
    });
    triggerReply(active.id, active.creator.id);
  };

  const unlock = (messageId: string) => {
    if (!active) return;
    const m = active.messages.find((x) => x.id === messageId);
    if (!m || !m.coins) return;
    if (balance < m.coins) {
      notify('Not enough coins to unlock this drop.');
      return;
    }
    setBalance((b) => b - m.coins!);
    updateConv(active.id, (c) => ({
      ...c,
      messages: c.messages.map((x) =>
        x.id === messageId ? { ...x, unlocked: true } : x
      ),
    }));
    setJustUnlocked(messageId);
    notify(`Drop unlocked for ${m.coins} coins 🔓`);
    timers.current.push(window.setTimeout(() => setJustUnlocked(null), 1500));
  };

  const sendTip = (amount: number, note: string) => {
    if (!active) return;
    setBalance((b) => b - amount);
    pushMessage(active.id, {
      id: nid(),
      sender: 'fan',
      type: 'tip',
      tipAmount: amount,
      text: note,
      time: now(),
    });
    setTipOpen(false);
    notify(`Sent 💎 ${amount} coins to ${active.creator.name}`);
    triggerReply(active.id, active.creator.id);
  };

  const handleSidebarNavigate = (item: NavItem) => {
    if (item.id === 'home') {
      navigate('/app');
    } else if (item.id === 'messages') {
      // already on messages
    } else if (item.id === 'notifications') {
      navigate('/notifications');
    } else if (item.id === 'live') {
      navigate('/live');
    } else if (item.id === 'subscriptions') {
      navigate('/subscriptions');
    } else if (item.id === 'explore' || item.id === 'creators') {
      navigate('/explore');
    } else if (item.id === 'settings') {
      navigate('/settings');
    } else if (item.tab) {
      navigate('/app');
    } else {
      notify(`${item.label} coming soon`);
    }
  };

  const vaultMedia =
    active?.messages.filter((m) => m.type === 'ppv' || m.type === 'image') ?? [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper text-ink">
      {/* 1. Global Left Sidebar (Desktop 1024px+ or compact 768px+) */}
      <Sidebar
        activeTab="messages"
        onNavigate={handleSidebarNavigate}
        onCreate={() => notify('Creator post composer')}
        onLogoClick={() => navigate('/')}
      />

      {/* 2. Messages Main Workspace */}
      <div className="flex flex-1 min-w-0 h-full flex-col md:flex-row overflow-hidden relative">
        
        {/* Mobile Top Bar (only visible when in list view on mobile) */}
        <div className={cn('md:hidden', activeId ? 'hidden' : 'block')}>
          <MobileTopBar onNotify={notify} />
        </div>

        {/* 2A. Conversations Column */}
        <aside
          className={cn(
            'h-full w-full shrink-0 md:block md:w-[320px] lg:w-[350px] overflow-hidden',
            activeId ? 'hidden md:block' : 'flex-1 md:flex-initial'
          )}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={select}
          />
        </aside>

        {/* 2B. Active Chat Arena */}
        <section
          className={cn(
            'relative h-full min-w-0 flex-1 flex-col bg-surface',
            activeId ? 'flex' : 'hidden md:flex'
          )}
        >
          {active ? (
            <>
              {/* Chat Header */}
              <ChatHeader
                creator={active.creator}
                onBack={() => setActiveId(null)}
                onTip={() => setTipOpen(true)}
                onToggleVault={() => setVaultOpen((v) => !v)}
                vaultOpen={vaultOpen}
                muted={!!muted[active.id]}
                onToggleMute={() => {
                  setMuted((m) => ({ ...m, [active.id]: !m[active.id] }));
                  notify(
                    muted[active.id]
                      ? 'Notifications unmuted'
                      : 'Notifications muted'
                  );
                }}
              />

              {/* Chat Timeline & Media Vault Drawer */}
              <div className="relative flex min-h-0 flex-1 overflow-hidden">
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <ChatStream
                    key={active.id}
                    conversation={active}
                    typing={typing}
                    onUnlock={unlock}
                    justUnlockedId={justUnlocked}
                  />

                  <MessageComposer
                    handle={active.creator.handle}
                    onSend={send}
                    onSendVoice={sendVoice}
                    onTip={() => setTipOpen(true)}
                  />
                </div>

                {/* Media Vault Slide-in Panel */}
                {vaultOpen && (
                  <div className="absolute inset-y-0 right-0 z-20 flex w-full sm:w-80 flex-col border-l border-line bg-surface shadow-float animate-fade-in lg:static lg:shadow-none">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                        <Images className="h-4 w-4 text-brand" />
                        <span>Media Vault</span>
                        <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-semibold text-muted">
                          {vaultMedia.length}
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setVaultOpen(false)}
                        className="rounded-full p-1.5 text-muted hover:bg-paper hover:text-ink transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                      {vaultMedia.length === 0 ? (
                        <p className="py-12 text-center text-xs text-muted">
                          No photos or drops shared in this thread yet.
                        </p>
                      ) : (
                        vaultMedia.map((m) => (
                          <div
                            key={m.id}
                            className="group relative aspect-video overflow-hidden rounded-xl border border-line bg-paper-warm shadow-sm"
                          >
                            <img
                              src={m.mediaUrl}
                              alt=""
                              className={cn(
                                'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
                                m.type === 'ppv' && !m.unlocked ? 'blur-md' : ''
                              )}
                            />

                            {m.type === 'ppv' && !m.unlocked ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/40 p-2 text-center">
                                <Lock className="h-5 w-5 text-white" />
                                <span className="mt-1 text-[11px] font-bold text-white">
                                  💎 {m.coins} coins
                                </span>
                                <button
                                  type="button"
                                  onClick={() => unlock(m.id)}
                                  className="mt-1.5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold text-white hover:bg-brand-deep transition-colors"
                                >
                                  Unlock
                                </button>
                              </div>
                            ) : (
                              <div className="absolute bottom-1.5 left-1.5 rounded-md bg-ink/75 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                                {m.mediaLabel || 'Media'}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State when no conversation is selected (Desktop) */
            <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-paper">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-line shadow-card text-brand mb-4">
                <Images className="h-7 w-7" />
              </div>
              <h2 className="font-bold text-[20px] tracking-tight text-ink">
                Your Direct Conversations
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Select a creator from the left to view messages, unlocked drops, or send tips.
              </p>
            </div>
          )}
        </section>

        {/* Mobile Bottom Navigation (only shown when in inbox list view on mobile) */}
        <div className={cn('md:hidden', activeId ? 'hidden' : 'block')}>
          <MobileBottomNav
            activeTab="messages"
            onNavigate={(item) => {
              if (item.id === 'home' || item.id === 'explore') {
                navigate('/app');
              } else if (item.id === 'profile') {
                notify('Fan Profile settings');
              }
            }}
            onCreate={() => notify('Drop composer')}
          />
        </div>
      </div>

      {/* Tip Modal */}
      {tipOpen && active && (
        <TipModal
          creator={active.creator}
          balance={balance}
          onClose={() => setTipOpen(false)}
          onSendTip={sendTip}
        />
      )}

      {/* Toast Alert */}
      <Toast message={toast} />
    </div>
  );
}
