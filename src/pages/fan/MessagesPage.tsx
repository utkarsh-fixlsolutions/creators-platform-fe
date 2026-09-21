import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Images, Lock, X, Gem } from 'lucide-react';
import ConversationList from '../../components/messages/ConversationList';
import ChatHeader from '../../components/messages/ChatHeader';
import ChatStream from '../../components/messages/ChatStream';
import MessageComposer from '../../components/messages/MessageComposer';
import ChatProfilePanel from '../../components/messages/ChatProfilePanel';
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
  const [profileOpen, setProfileOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1280
  );
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

  const toggleMute = () => {
    if (!active) return;
    setMuted((m) => ({ ...m, [active.id]: !m[active.id] }));
    notify(muted[active.id] ? 'Notifications unmuted' : 'Notifications muted');
  };

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
            'h-full w-full shrink-0 md:w-[300px] lg:w-[330px] xl:w-[340px] overflow-hidden',
            activeId ? 'hidden lg:block' : 'flex-1 md:flex-initial'
          )}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={select}
          />
        </aside>

        {/* 2B. Active Chat Arena & Creator Info Drawer */}
        <section
          className={cn(
            'relative h-full min-w-0 flex-1 flex-col bg-surface overflow-hidden',
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
                onToggleVault={() => setProfileOpen((p) => !p)}
                vaultOpen={profileOpen}
                profileOpen={profileOpen}
                onToggleProfile={() => setProfileOpen((p) => !p)}
                muted={!!muted[active.id]}
                onToggleMute={toggleMute}
              />

              {/* Chat Timeline & Creator Profile Right Rail */}
              <div className="relative flex min-h-0 flex-1 overflow-hidden">
                {/* Center Chat Stream & Message Composer */}
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-paper">
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

                {/* Desktop Creator Details & Media Right Panel */}
                <div
                  className={cn(
                    'hidden lg:flex h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out',
                    profileOpen ? 'w-80 xl:w-[340px]' : 'w-0 border-l-0'
                  )}
                >
                  {profileOpen && (
                    <ChatProfilePanel
                      conversation={active}
                      onClose={() => setProfileOpen(false)}
                      onTip={() => setTipOpen(true)}
                      onUnlock={unlock}
                      muted={!!muted[active.id]}
                      onToggleMute={toggleMute}
                    />
                  )}
                </div>

                {/* Mobile / Tablet Slide-Over Drawer */}
                {profileOpen && (
                  <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs lg:hidden animate-fade-in">
                    <div className="h-full w-full sm:w-80 bg-surface shadow-float">
                      <ChatProfilePanel
                        conversation={active}
                        onClose={() => setProfileOpen(false)}
                        onTip={() => setTipOpen(true)}
                        onUnlock={unlock}
                        muted={!!muted[active.id]}
                        onToggleMute={toggleMute}
                      />
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
              if (item.id === 'home') {
                navigate('/app');
              } else if (item.id === 'explore' || item.id === 'creators') {
                navigate('/explore');
              } else if (item.id === 'subscriptions') {
                navigate('/subscriptions');
              } else if (item.id === 'messages') {
                setActiveId(null);
              } else if (item.id === 'profile' || item.id === 'settings') {
                navigate('/settings');
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
