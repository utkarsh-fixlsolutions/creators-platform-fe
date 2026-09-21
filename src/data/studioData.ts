import type { Conversation, Creator as ConversationPartner } from './messagesData';

/* ---------------------------------------------------------------------------
   Shared creator-side mock data — the studio equivalent of messagesData.ts.
   Every /studio/* page reads from here instead of inventing its own arrays.
--------------------------------------------------------------------------- */

export type StudioRange = '7d' | '30d' | 'all';

/* ---------- Dashboard KPIs ---------- */

export interface KpiSet {
  followers: number;
  followersDelta: string;
  subscribers: number;
  subscribersDelta: string;
  earnings: number;
  earningsDelta: string;
  impressions: number;
  impressionsDelta: string;
}

export const KPI_BY_RANGE: Record<StudioRange, KpiSet> = {
  '7d': {
    followers: 42_100,
    followersDelta: '+12%',
    subscribers: 1_248,
    subscribersDelta: '+8%',
    earnings: 4320,
    earningsDelta: '+18%',
    impressions: 278_000,
    impressionsDelta: '+22%',
  },
  '30d': {
    followers: 42_100,
    followersDelta: '+31%',
    subscribers: 1_248,
    subscribersDelta: '+19%',
    earnings: 15_860,
    earningsDelta: '+24%',
    impressions: 942_000,
    impressionsDelta: '+15%',
  },
  all: {
    followers: 42_100,
    followersDelta: '+142%',
    subscribers: 1_248,
    subscribersDelta: '+89%',
    earnings: 118_420,
    earningsDelta: '+6%',
    impressions: 6_120_000,
    impressionsDelta: '+9%',
  },
};

/* ---------- Content ---------- */

export type ContentType = 'video' | 'image' | 'text' | 'live';
export type ContentStatus = 'published' | 'subscribers' | 'draft';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  thumbnail?: string;
  meta: string; // "0:42" duration, "3 images", "1:12" etc.
  views: number;
  likes: number;
  status: ContentStatus;
  time: string;
  price?: number;
}

export const CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'ct_1',
    title: 'Studio days 🌿',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=300&q=80',
    meta: '0:42',
    views: 24_100,
    likes: 3_200,
    status: 'published',
    time: '2h ago',
  },
  {
    id: 'ct_2',
    title: 'New collection sneak peek',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=300&q=80',
    meta: '3 images',
    views: 18_300,
    likes: 2_100,
    status: 'published',
    time: '1d ago',
  },
  {
    id: 'ct_3',
    title: 'Behind the process',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80',
    meta: '4 images',
    views: 12_600,
    likes: 1_400,
    status: 'published',
    time: '2d ago',
  },
  {
    id: 'ct_4',
    title: 'Sunday Q&A',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80',
    meta: '1:12',
    views: 8_400,
    likes: 1_100,
    status: 'subscribers',
    time: '3d ago',
  },
  {
    id: 'ct_5',
    title: 'A quiet morning',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=300&q=80',
    meta: '1 image',
    views: 16_900,
    likes: 2_800,
    status: 'published',
    time: '4d ago',
  },
  {
    id: 'ct_6',
    title: 'Sketch to final',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=300&q=80',
    meta: '3 images',
    views: 0,
    likes: 0,
    status: 'draft',
    time: 'Draft',
  },
];

/* ---------- Analytics ---------- */

export interface AudiencePoint {
  label: string;
  followers: number;
}

const FULL_AUDIENCE_SERIES: AudiencePoint[] = [
  { label: 'Aug 10', followers: 12_400 },
  { label: 'Aug 15', followers: 15_800 },
  { label: 'Aug 20', followers: 19_600 },
  { label: 'Aug 25', followers: 24_100 },
  { label: 'Aug 30', followers: 29_300 },
  { label: 'Sep 3', followers: 34_700 },
  { label: 'Sep 8', followers: 38_900 },
  { label: 'Sep 11', followers: 40_600 },
  { label: 'Sep 13', followers: 41_400 },
  { label: 'Sep 15', followers: 42_100 },
];

export function audienceSeriesForRange(range: StudioRange): AudiencePoint[] {
  if (range === '7d') return FULL_AUDIENCE_SERIES.slice(-4);
  if (range === '30d') return FULL_AUDIENCE_SERIES.slice(-7);
  return FULL_AUDIENCE_SERIES;
}

export const TRAFFIC_SOURCES = [
  { label: 'For You', percent: 48 },
  { label: 'Following', percent: 28 },
  { label: 'Search', percent: 14 },
  { label: 'Shared links', percent: 10 },
];

/* ---------- Earnings ---------- */

export interface EarningsBreakdownRow {
  id: string;
  label: string;
  amount: number;
  delta: string;
}

export const EARNINGS_BREAKDOWN: EarningsBreakdownRow[] = [
  { id: 'subs', label: 'Subscriptions', amount: 2480, delta: '+12%' },
  { id: 'tips', label: 'Tips', amount: 620, delta: '+28%' },
  { id: 'paid', label: 'Paid content', amount: 980, delta: '+16%' },
  { id: 'messages', label: 'Messages', amount: 240, delta: '+8%' },
];

export interface EarningsTransaction {
  id: string;
  fanName: string;
  fanAvatar: string;
  category: 'tip' | 'subscription' | 'paid_content' | 'message';
  label: string;
  amount: number;
  date: string;
}

export const EARNINGS_TRANSACTIONS: EarningsTransaction[] = [
  {
    id: 'et_1',
    fanName: 'liam.t',
    fanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    category: 'tip',
    label: 'Tip',
    amount: 10.0,
    date: '2h ago',
  },
  {
    id: 'et_2',
    fanName: 'sophia.k',
    fanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    category: 'subscription',
    label: 'Subscription (Monthly)',
    amount: 14.99,
    date: '1d ago',
  },
  {
    id: 'et_3',
    fanName: 'm.chaudhary',
    fanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    category: 'paid_content',
    label: 'Unlocked "Sunday Q&A"',
    amount: 9.99,
    date: '2d ago',
  },
  {
    id: 'et_4',
    fanName: 'alex.rivera',
    fanAvatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=100&q=80',
    category: 'message',
    label: 'PPV message unlocked',
    amount: 4.99,
    date: '3d ago',
  },
  {
    id: 'et_5',
    fanName: 'priya.verma',
    fanAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
    category: 'subscription',
    label: 'Subscription (Monthly)',
    amount: 14.99,
    date: '4d ago',
  },
];

export const EARNINGS_BALANCE = {
  total: 4320.0,
  totalDelta: '+18% from last month',
  available: 3120.0,
  processing: 1200.0,
};

/* ---------- Notifications ---------- */

export type StudioNotificationKind =
  | 'subscription'
  | 'tip'
  | 'like'
  | 'comment'
  | 'mention'
  | 'follower'
  | 'milestone';

export interface StudioNotificationItem {
  id: string;
  kind: StudioNotificationKind;
  name: string;
  avatar: string;
  text: string;
  time: string;
  unread: boolean;
}

export const STUDIO_NOTIFICATIONS: StudioNotificationItem[] = [
  {
    id: 'sn_1',
    kind: 'subscription',
    name: 'sophia.k',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    text: 'renewed their subscription',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'sn_2',
    kind: 'tip',
    name: 'liam.t',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    text: 'sent a tip of $10',
    time: '2h ago',
    unread: true,
  },
  {
    id: 'sn_3',
    kind: 'like',
    name: 'alex.rivera',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=100&q=80',
    text: 'liked your post',
    time: '3h ago',
    unread: false,
  },
  {
    id: 'sn_4',
    kind: 'comment',
    name: 'm.chaudhary',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    text: 'commented: "This is amazing!"',
    time: '4h ago',
    unread: false,
  },
  {
    id: 'sn_5',
    kind: 'subscription',
    name: 'jordanlee',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    text: 'subscribed to your content',
    time: '6h ago',
    unread: false,
  },
  {
    id: 'sn_6',
    kind: 'mention',
    name: 'priya.verma',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
    text: 'mentioned you in a message',
    time: '8h ago',
    unread: false,
  },
  {
    id: 'sn_7',
    kind: 'follower',
    name: 'kevin_art',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    text: 'started following you',
    time: '10h ago',
    unread: false,
  },
  {
    id: 'sn_8',
    kind: 'milestone',
    name: 'Studio',
    avatar: '',
    text: 'Your post hit 10K views — that\'s 2x more than your average!',
    time: '1d ago',
    unread: false,
  },
];

/* ---------- Messages (creator inbox) ---------- */
/** Reuses the shared Conversation/Message/Creator shape from messagesData.ts —
 *  here `creator` holds the *fan's* profile (the other party in the DM). */

export const STUDIO_CONVERSATIONS: Conversation[] = [
  {
    id: 'sc_1',
    unread: 2,
    lastTime: '2m',
    pinned: true,
    creator: {
      id: 'alex-rivera',
      name: 'alex.rivera',
      handle: '@alex.rivera',
      category: 'VIP subscriber · $340 lifetime spend',
      avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
      verified: false,
      online: true,
      vip: true,
      subscription: 'VIP tier · Renews Oct 2',
    },
    messages: [
      { id: 'a1', sender: 'fan', type: 'text', text: "Can't wait for your next post! 🙌", time: '2:10 PM' },
      { id: 'a2', sender: 'fan', type: 'tip', tipAmount: 50, text: 'For the last drop!', time: '2:12 PM' },
    ],
  },
  {
    id: 'sc_2',
    unread: 1,
    lastTime: '12m',
    creator: {
      id: 'jordanlee',
      name: 'jordanlee',
      handle: '@jordanlee',
      category: 'Subscriber · $60 lifetime spend',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
      verified: false,
      online: false,
      vip: false,
      subscription: 'Standard tier · Renews Oct 9',
    },
    messages: [
      { id: 'j1', sender: 'fan', type: 'text', text: 'Loved the new video! 💗', time: '1:55 PM' },
    ],
  },
  {
    id: 'sc_3',
    unread: 1,
    lastTime: '28m',
    creator: {
      id: 'm-chaudhary',
      name: 'm.chaudhary',
      handle: '@m.chaudhary',
      category: 'Subscriber · $28 lifetime spend',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      verified: false,
      online: true,
      vip: false,
      subscription: 'Standard tier · Renews Oct 21',
    },
    messages: [{ id: 'm1', sender: 'fan', type: 'text', text: 'This is amazing!', time: '1:30 PM' }],
  },
  {
    id: 'sc_4',
    unread: 0,
    lastTime: '1h',
    creator: {
      id: 'sophia-k',
      name: 'sophia.k',
      handle: '@sophia.k',
      category: 'VIP subscriber · $420 lifetime spend',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      verified: true,
      online: false,
      vip: true,
      subscription: 'VIP tier · Renews Oct 14',
    },
    messages: [
      { id: 's1', sender: 'fan', type: 'text', text: 'Just renewed for another month! 🎉', time: '12:40 PM' },
    ],
  },
  {
    id: 'sc_5',
    unread: 0,
    lastTime: '5h',
    creator: {
      id: 'priya-verma',
      name: 'priya.verma',
      handle: '@priya.verma',
      category: 'Subscriber · $45 lifetime spend',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      verified: false,
      online: false,
      vip: false,
      subscription: 'Standard tier · Renews Oct 26',
    },
    messages: [{ id: 'p1', sender: 'fan', type: 'text', text: 'When is the next drop?', time: '9:05 AM' }],
  },
];

/** Scripted, delayed replies so the creator inbox demo feels alive, mirroring
 *  messagesData.ts's creatorReplies pattern but from the fan's side. */
export const fanReplies: Record<string, string[]> = {
  'alex-rivera': [
    "You're the best, seriously! 🙏",
    'Following your every post now!',
    'Take your time, quality over speed 💯',
  ],
  jordanlee: ['Thank you for replying! 😊', "Can't wait to see more."],
  'm-chaudhary': ['Appreciate you! ❤️', 'You always make my day better.'],
  'sophia-k': ['Worth every penny 💎', "You're so talented!"],
  'priya-verma': ['Looking forward to it!', 'No rush, love your work either way.'],
};

export type { Conversation, ConversationPartner };
