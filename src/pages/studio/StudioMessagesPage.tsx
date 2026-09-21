import { useCallback, useEffect, useRef, useState } from 'react';
import ConversationList from '../../components/messages/ConversationList';
import ChatHeader from '../../components/messages/ChatHeader';
import ChatStream from '../../components/messages/ChatStream';
import MessageComposer from '../../components/messages/MessageComposer';
import { Toast } from '../../components/Toast';
import { STUDIO_CONVERSATIONS, fanReplies } from '../../data/studioData';
import type { Conversation, Message } from '../../data/messagesData';
import { MessageSquare } from 'lucide-react';

const now = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
let uid = 9000;
const nid = () => `studio-msg-${uid++}`;

export function StudioMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(STUDIO_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1024 ? STUDIO_CONVERSATIONS[0]?.id ?? null : null
  );
  const [typing, setTyping] = useState(false);
  const [muted, setMuted] = useState<Record<string, boolean>>({});
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
    setTyping(false);
    updateConv(id, (c) => ({ ...c, unread: 0 }));
  };

  const pushMessage = (convId: string, m: Message) => {
    updateConv(convId, (c) => ({ ...c, messages: [...c.messages, m], lastTime: 'Just now' }));
  };

  const triggerReply = (convId: string, fanId: string) => {
    const t1 = window.setTimeout(() => setTyping(true), 700);
    const t2 = window.setTimeout(() => {
      setTyping(false);
      const pool = fanReplies[fanId] ?? ['Thank you! ✨'];
      const i = replyIdx.current[fanId] ?? 0;
      replyIdx.current[fanId] = i + 1;
      pushMessage(convId, { id: nid(), sender: 'fan', type: 'text', text: pool[i % pool.length], time: now() });
    }, 2200 + Math.random() * 500);
    timers.current.push(t1, t2);
  };

  const handleSend = (text: string, imageUrl?: string) => {
    if (!active) return;
    if (imageUrl) pushMessage(active.id, { id: nid(), sender: 'creator', type: 'image', mediaUrl: imageUrl, time: now() });
    if (text) pushMessage(active.id, { id: nid(), sender: 'creator', type: 'text', text, time: now() });
    triggerReply(active.id, active.creator.id);
  };

  const handleSendVoice = (duration: number) => {
    if (!active) return;
    pushMessage(active.id, { id: nid(), sender: 'creator', type: 'voice', duration, time: now() });
    triggerReply(active.id, active.creator.id);
  };

  return (
    <div className="-mx-4 sm:-mx-6 -my-5 md:-my-10 h-[calc(100dvh-116px)] md:h-[calc(100vh-64px)] flex overflow-hidden rounded-none md:rounded-[24px] md:border md:border-line md:my-4 md:mx-0">
      <div className={`${activeId ? 'hidden lg:flex' : 'flex'} w-full lg:w-[360px] shrink-0`}>
        <ConversationList conversations={conversations} activeId={activeId} onSelect={select} />
      </div>

      <div className={`${activeId ? 'flex' : 'hidden lg:flex'} flex-1 min-w-0 flex-col bg-paper`}>
        {active ? (
          <>
            <ChatHeader
              creator={active.creator}
              onBack={() => setActiveId(null)}
              onTip={() => notify('Fan rewards & shoutouts — coming soon')}
              onToggleVault={() => notify('Media vault — coming soon')}
              vaultOpen={false}
              muted={!!muted[active.id]}
              onToggleMute={() => setMuted((m) => ({ ...m, [active.id]: !m[active.id] }))}
            />
            <ChatStream
              conversation={active}
              typing={typing}
              onUnlock={() => {}}
              justUnlockedId={null}
              viewerRole="creator"
              typingLabel={`${active.creator.name} is typing...`}
              noticeText={
                <>
                  🔒 Direct message stream with <span className="font-semibold text-ink">{active.creator.name}</span>.
                </>
              }
            />
            <MessageComposer
              handle={active.creator.handle}
              onSend={handleSend}
              onSendVoice={handleSendVoice}
              onTip={() => notify('Fan rewards & shoutouts — coming soon')}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center px-6">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-brand shadow-card ring-1 ring-line">
              <MessageSquare className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <p className="text-sm font-semibold text-ink">Select a conversation</p>
            <p className="text-xs text-muted max-w-[28ch]">Choose a fan from the list to view your conversation.</p>
          </div>
        )}
      </div>

      <Toast message={toast} />
    </div>
  );
}
