export type MessageType = 'text' | 'ppv' | 'voice' | 'tip' | 'image';

export interface Message {
  id: string;
  sender: 'fan' | 'creator';
  type: MessageType;
  text?: string;
  time: string;
  // ppv locked drops
  mediaUrl?: string;
  mediaKind?: 'photo' | 'video';
  price?: number;
  coins?: number;
  unlocked?: boolean;
  mediaLabel?: string;
  // voice memo
  duration?: number;
  // coin tip
  tipAmount?: number;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  category: string;
  avatar: string;
  verified: boolean;
  online: boolean;
  vip: boolean;
  subscription: string;
}

export interface Conversation {
  id: string;
  creator: Creator;
  unread: number;
  lastTime: string;
  pinned?: boolean;
  messages: Message[];
}

export const coinBalance = 850;

export const initialConversations: Conversation[] = [
  {
    id: 'c1',
    unread: 2,
    lastTime: '2m',
    pinned: true,
    creator: {
      id: 'maya',
      name: 'Maya Chen',
      handle: '@mayachen',
      category: 'Haute Editorial & Still Life',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      verified: true,
      online: true,
      vip: true,
      subscription: 'VIP Pass · Renews Oct 14',
    },
    messages: [
      { id: 'm1', sender: 'fan', type: 'text', text: 'Hey Maya! Loved the new Atelier Spring editorial drop 🌸', time: '10:02 AM' },
      { id: 'm2', sender: 'creator', type: 'text', text: 'Aww thank you so much! That Paris shoot was pure magic to put together 💛', time: '10:04 AM' },
      { id: 'm3', sender: 'creator', type: 'voice', duration: 24, time: '10:05 AM' },
      { id: 'm4', sender: 'fan', type: 'tip', tipAmount: 150, text: 'For the incredible backstage film!', time: '10:07 AM' },
      { id: 'm5', sender: 'creator', type: 'text', text: "You're the sweetest! 😭 Here's an unreleased 4K sequence only my VIP collectors get access to:", time: '10:08 AM' },
      {
        id: 'm6',
        sender: 'creator',
        type: 'ppv',
        mediaKind: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
        price: 4.99,
        coins: 200,
        unlocked: false,
        mediaLabel: 'Exclusive 4K Master Cut · 03:18 min',
        time: '10:08 AM',
      },
      { id: 'm7', sender: 'creator', type: 'text', text: 'Let me know what you think of the color grading! 👀', time: '10:09 AM' },
    ],
  },
  {
    id: 'c2',
    unread: 0,
    lastTime: '1h',
    creator: {
      id: 'lucas',
      name: 'Lucas Ferreira',
      handle: '@lucasfit',
      category: 'High-Performance Movement',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      verified: true,
      online: false,
      vip: false,
      subscription: 'Active Tier 1 Member',
    },
    messages: [
      { id: 'l1', sender: 'creator', type: 'text', text: 'The new 8-week mobility & explosive strength blueprint is live 🔥 Want the direct early-access breakdown?', time: '9:12 AM' },
      { id: 'l2', sender: 'fan', type: 'text', text: 'Yes please Lucas! Been waiting for the updated lifting routine.', time: '9:20 AM' },
      {
        id: 'l3',
        sender: 'creator',
        type: 'ppv',
        mediaKind: 'photo',
        mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
        price: 9.99,
        coins: 350,
        unlocked: false,
        mediaLabel: 'Olympic Lifting Mechanics Masterfile + PDF',
        time: '9:22 AM',
      },
    ],
  },
  {
    id: 'c3',
    unread: 3,
    lastTime: '3h',
    creator: {
      id: 'noor',
      name: 'Noor Adeyemi',
      handle: '@noorsound',
      category: 'Modular Synthesizers & Soundscapes',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      verified: true,
      online: true,
      vip: true,
      subscription: 'VIP Sound Lab Pass',
    },
    messages: [
      { id: 'n1', sender: 'creator', type: 'text', text: 'Just patched a 64-step analog sequence with the Buchla clone. It has such deep resonance 🎧', time: '6:40 AM' },
      { id: 'n2', sender: 'creator', type: 'voice', duration: 42, time: '6:42 AM' },
      { id: 'n3', sender: 'creator', type: 'text', text: 'Sending the raw WAV stem pack and project files below:', time: '6:45 AM' },
      {
        id: 'n4',
        sender: 'creator',
        type: 'ppv',
        mediaKind: 'photo',
        mediaUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
        price: 7.99,
        coins: 300,
        unlocked: false,
        mediaLabel: 'Raw 24-bit Modular Sample Pack (48 Files)',
        time: '6:46 AM',
      },
    ],
  },
  {
    id: 'c4',
    unread: 0,
    lastTime: 'Yesterday',
    creator: {
      id: 'sofia',
      name: 'Sofia Rossi',
      handle: '@sofiarossi',
      category: 'Architectural Sculptures & Ceramic Art',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      verified: true,
      online: false,
      vip: false,
      subscription: 'Studio Backer',
    },
    messages: [
      { id: 's1', sender: 'fan', type: 'text', text: 'Sofia, the travertine vase series arrived in London! The matte texture is incredible.', time: 'Yesterday' },
      { id: 's2', sender: 'creator', type: 'text', text: 'Oh I am overjoyed to hear that! Each piece was hand-honed in our Florence studio. Thank you for your support ❤️', time: 'Yesterday' },
    ],
  },
];

export const creatorReplies: Record<string, string[]> = {
  maya: [
    "Thank you for the love! You're making my day ✨",
    "Sending you exclusive preview frames straight from the darkroom!",
    "Appreciate you following the journey! More drops are on the way 💫",
    "Got your note! Working on the next seasonal lookbook now 📸",
  ],
  lucas: [
    "Appreciate the energy! Let's get that workout crushed today 💪",
    "Consistency is everything — keep pushing the limits!",
    "Dropping form check feedback in your DMs soon 🔥",
  ],
  noor: [
    "So glad that resonance hit you! Mixing the next ambient album as we speak 🎛️",
    "Thanks for supporting the indie sound lab!",
    "Sending audio stems straight over 🎹",
  ],
  sofia: [
    "Grazie mille! Honored to have my sculptures in your home ✨",
    "Firing the next kiln batch tonight! Stay tuned for the new collection.",
  ],
};
