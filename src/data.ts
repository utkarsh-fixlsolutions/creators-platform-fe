/* ---------------------------------------------------------------------------
   Mock content for the Discovery feed.
   Photography via Pexels (free to use). URLs are cropped server‑side.
--------------------------------------------------------------------------- */

const photo = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

const media = (id: number) => photo(id, 1200, 900);
const avatar = (id: number) => photo(id, 160, 160);

export type FeedTab =
  | "foryou"
  | "following"
  | "search"
  | "exclusive"
  | "live"
  | "trending"
  | "collections";

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  category: string;
  fans: number;
  verified?: boolean;
  following: boolean;
  /** Monthly membership price — creators offering exclusive content */
  membership?: number;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
}

export interface Post {
  id: string;
  creatorId: string;
  image: string;
  alt: string;
  caption: string;
  tags: string[];
  likes: number;
  liked: boolean;
  commentCount: number;
  comments: Comment[];
  timeAgo: string;
  exclusive?: boolean;
  unlocked?: boolean;
  live?: { viewers: number };
  video?: { duration: string };
  collection?: string;
  location?: string;
}

export const ME = {
  name: "Maya Chen",
  handle: "maya.makes",
  avatar: avatar(9489925),
};

export const CREATORS: Creator[] = [
  {
    id: "noor",
    name: "Noor Adeyemi",
    handle: "noor.clay",
    avatar: avatar(35240848),
    category: "Ceramics",
    fans: 84_300,
    verified: true,
    following: true,
    membership: 5,
  },
  {
    id: "ines",
    name: "Inês Duarte",
    handle: "ines.draws",
    avatar: avatar(14587417),
    category: "Illustration",
    fans: 212_000,
    verified: true,
    following: false,
  },
  {
    id: "lucas",
    name: "Lucas Ferreira",
    handle: "lucas.cooks",
    avatar: avatar(33148747),
    category: "Food",
    fans: 56_900,
    following: true,
  },
  {
    id: "amara",
    name: "Amara Osei",
    handle: "amara.atelier",
    avatar: avatar(11701102),
    category: "Fashion",
    fans: 148_000,
    verified: true,
    following: false,
    membership: 6,
  },
  {
    id: "theo",
    name: "Theo Marchetti",
    handle: "theo.shoots",
    avatar: avatar(14807440),
    category: "Photography",
    fans: 97_400,
    verified: true,
    following: true,
    membership: 5,
  },
  {
    id: "kofi",
    name: "Kofi Mensah",
    handle: "kofi.wav",
    avatar: avatar(7562076),
    category: "Music",
    fans: 61_200,
    following: true,
    membership: 4,
  },
  {
    id: "sana",
    name: "Sana Iqbal",
    handle: "sana.roams",
    avatar: avatar(3756907),
    category: "Travel film",
    fans: 320_000,
    verified: true,
    following: false,
  },
  // Suggested creators (no posts in this slice of the feed)
  {
    id: "jade",
    name: "Jade Lin",
    handle: "jade.paints",
    avatar: avatar(2992517),
    category: "Painting",
    fans: 48_100,
    following: false,
  },
  {
    id: "marcus",
    name: "Marcus Bell",
    handle: "marcus.woodwork",
    avatar: avatar(33680674),
    category: "Woodworking",
    fans: 22_700,
    following: false,
  },
  {
    id: "valentina",
    name: "Valentina Ruiz",
    handle: "vale.dances",
    avatar: avatar(13912725),
    category: "Dance",
    fans: 131_000,
    verified: true,
    following: false,
  },
  {
    id: "priya",
    name: "Priya Nair",
    handle: "priya.writes",
    avatar: avatar(21849467),
    category: "Writing",
    fans: 17_900,
    following: false,
  },
];

export const SUGGESTED_IDS = ["jade", "valentina", "marcus", "priya"];

const c = (id: string, author: string, av: number, text: string, timeAgo: string): Comment => ({
  id,
  author,
  avatar: avatar(av),
  text,
  timeAgo,
});

export const POSTS: Post[] = [
  {
    id: "p1",
    creatorId: "noor",
    image: media(6693557),
    alt: "Hands shaping clay on a wooden table, photographed from above",
    caption:
      "Threw forty mugs for the spring drop today. Glaze tests came back and the speckled oat is staying — it was never really a debate.",
    tags: ["ceramics", "studiodiary"],
    likes: 3_240,
    liked: false,
    commentCount: 148,
    comments: [
      c("c1", "Jade Lin", 2992517, "The oat glaze is *the one*. Please tell me the drop has a waitlist.", "1h"),
      c("c2", "Marcus Bell", 33680674, "Forty in a day is unreal. Wrists okay?", "44m"),
    ],
    timeAgo: "2h",
  },
  {
    id: "p2",
    creatorId: "ines",
    image: media(5904069),
    alt: "Close-up of hands drawing with a stylus on a graphics tablet",
    caption:
      "Three weeks of linework compressed into forty-two seconds. The poster series for the Lisbon show drops Friday.",
    tags: ["illustration", "process"],
    likes: 5_810,
    liked: false,
    commentCount: 302,
    comments: [
      c("c3", "Priya Nair", 21849467, "The way the composition snaps together at 0:31 — chills.", "3h"),
      c("c4", "Theo Marchetti", 14807440, "Save me a print. Any size. All sizes.", "2h"),
    ],
    timeAgo: "4h",
    video: { duration: "0:42" },
  },
  {
    id: "p3",
    creatorId: "lucas",
    image: media(36430150),
    alt: "A chef carefully plating a gourmet dish in a professional kitchen",
    caption:
      "Sunday supper club is live: miso brown-butter scallops, start to finish. Ask me anything in the chat — yes, even about the burnt batch.",
    tags: ["cooking", "live"],
    likes: 892,
    liked: false,
    commentCount: 431,
    comments: [
      c("c5", "Valentina Ruiz", 13912725, "Watching from rehearsal and now I'm starving.", "just now"),
      c("c6", "Noor Adeyemi", 35240848, "Those plates look suspiciously familiar 👀", "2m"),
    ],
    timeAgo: "Live now",
    live: { viewers: 1_240 },
  },
  {
    id: "p4",
    creatorId: "amara",
    image: media(9849647),
    alt: "A fashion designer working with draped fabric in a studio",
    caption:
      "First look at the SS26 capsule. Members see the full lookbook 48 hours before anyone else — and get first dibs on the numbered pieces.",
    tags: ["fashion", "ss26"],
    likes: 4_120,
    liked: false,
    commentCount: 210,
    comments: [
      c("c7", "Jade Lin", 2992517, "The silhouette on look 03 is going to be everywhere by summer.", "5h"),
      c("c8", "Sana Iqbal", 3756907, "Already saving up. Take my money.", "4h"),
    ],
    timeAgo: "6h",
    exclusive: true,
    unlocked: false,
  },
  {
    id: "p5",
    creatorId: "theo",
    image: media(16418583),
    alt: "A photographer overlooking the Mexico City skyline at sunset",
    caption:
      "Rooftops of CDMX at 7:12pm. Shot on Portra 400, scanned this morning — the grain on this roll is unreal.",
    tags: ["filmphotography", "cdmx"],
    likes: 2_730,
    liked: false,
    commentCount: 96,
    comments: [
      c("c9", "Inês Duarte", 14587417, "That haze. That light. Teach me.", "8h"),
      c("c10", "Marcus Bell", 33680674, "Portra never misses.", "7h"),
    ],
    timeAgo: "9h",
    location: "Mexico City",
  },
  {
    id: "p6",
    creatorId: "kofi",
    image: media(17402638),
    alt: "A hand adjusting a glowing groovebox in a dim studio",
    caption:
      "Late-night session. Built the whole beat around a single kalimba sample. Stems and the project file are up for members.",
    tags: ["beats", "production"],
    likes: 1_930,
    liked: false,
    commentCount: 87,
    comments: [
      c("c11", "Lucas Ferreira", 33148747, "Been cooking to this all morning. Literally.", "10h"),
      c("c12", "Priya Nair", 21849467, "The swing on the hats is so good.", "9h"),
    ],
    timeAgo: "12h",
    exclusive: true,
    unlocked: true,
  },
  {
    id: "p7",
    creatorId: "sana",
    image: media(7995539),
    alt: "Aerial view of a rugged coastline and turquoise sea in Liguria",
    caption:
      "Liguria from 120 metres. The full 4K drone pack just landed in the Coastlines collection — 38 clips, colour-graded and raw.",
    tags: ["travel", "drone"],
    likes: 7_420,
    liked: false,
    commentCount: 264,
    comments: [
      c("c13", "Theo Marchetti", 14807440, "The water gradient in the third clip. Come on.", "1d"),
      c("c14", "Valentina Ruiz", 13912725, "Booking flights immediately.", "23h"),
    ],
    timeAgo: "1d",
    collection: "Coastlines",
  },
  {
    id: "p8",
    creatorId: "amara",
    image: media(8769327),
    alt: "A designer at a desk in a sewing studio surrounded by tools and cloth",
    caption:
      "Studio mornings. Pattern-cutting the trench before the fabric lands next week. Coffee count: three.",
    tags: ["fashion", "atelier"],
    likes: 1_480,
    liked: false,
    commentCount: 54,
    comments: [
      c("c15", "Noor Adeyemi", 35240848, "The light in your studio is criminal.", "1d"),
      c("c16", "Jade Lin", 2992517, "Three is amateur hour, Amara.", "1d"),
    ],
    timeAgo: "1d",
  },
  {
    id: "p9",
    creatorId: "noor",
    image: media(6023573),
    alt: "Hands centering a clay bowl on a spinning pottery wheel",
    caption:
      "Lesson 03 of Wheel Basics is up: centering without the fight. Twenty minutes, real time, no cuts.",
    tags: ["ceramics", "tutorial"],
    likes: 2_110,
    liked: false,
    commentCount: 120,
    comments: [
      c("c17", "Priya Nair", 21849467, "Finally centred a bowl on the first try because of this. Crying.", "2d"),
      c("c18", "Kofi Mensah", 7562076, "Wheel ASMR at its finest.", "2d"),
    ],
    timeAgo: "2d",
    collection: "Wheel Basics",
  },
  {
    id: "p10",
    creatorId: "theo",
    image: media(27574696),
    alt: "Hands holding a vintage film camera beside shimmering water at sunset",
    caption:
      "The Bosphorus roll, unedited. Every single RAW from the trip — including the ones I'd never post — for members.",
    tags: ["filmphotography", "istanbul"],
    likes: 1_620,
    liked: false,
    commentCount: 41,
    comments: [
      c("c19", "Sana Iqbal", 3756907, "The unedited ones are always the best ones.", "2d"),
      c("c20", "Inês Duarte", 14587417, "Joining just for this.", "2d"),
    ],
    timeAgo: "2d",
    exclusive: true,
    unlocked: false,
  },
];

export const TRENDING_TAGS = [
  { tag: "ceramics", posts: 12_400, delta: "+18%" },
  { tag: "filmphotography", posts: 9_800, delta: "+11%" },
  { tag: "ss26", posts: 7_100, delta: "+42%" },
  { tag: "process", posts: 5_600, delta: "+6%" },
  { tag: "drone", posts: 3_200, delta: "+9%" },
];

export const SEARCH_SUGGESTIONS = ["#ceramics", "Portra 400", "Lisbon", "kalimba", "#ss26"];

/* ---------------------------------------------------------------------------
   Notifications Types & Initial Data (spec matching Notifications.dc.html)
--------------------------------------------------------------------------- */

export type NotificationKind =
  | "post"
  | "live"
  | "message"
  | "tip"
  | "follow"
  | "comment"
  | "mention"
  | "verified"
  | "renewal"
  | "payout"
  | "shield"
  | "security"
  | "promo";

export type NotificationTone = "brand" | "gold" | "rose" | "ink";

export type NotificationCategory = "follows" | "verified" | "comments";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  tone: NotificationTone;
  day: "today" | "earlier";
  cat: NotificationCategory[];
  name: string;
  creatorId?: string;
  avatar?: string;
  verified?: boolean;
  system?: boolean;
  text: string;
  quote?: string;
  time: string;
  unread: boolean;
  pinging?: boolean;
  media?: string;
  locked?: boolean;
  tag?: string;
  action?: string;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    kind: "post",
    tone: "gold",
    day: "today",
    cat: ["verified"],
    name: "Noor Adeyemi",
    creatorId: "noor",
    avatar: avatar(35240848),
    verified: true,
    text: "posted a new exclusive drop — 4 photos, 1 clip",
    time: "2m",
    unread: true,
    media: photo(35240848, 240, 240),
    locked: true,
    tag: "Members only",
  },
  {
    id: "n2",
    kind: "live",
    tone: "rose",
    day: "today",
    cat: ["verified"],
    name: "Theo Marchetti",
    creatorId: "theo",
    avatar: avatar(14807440),
    verified: true,
    text: "is live now · 1.2k watching",
    time: "5m",
    unread: true,
    pinging: true,
    action: "Join",
  },
  {
    id: "n3",
    kind: "message",
    tone: "brand",
    day: "today",
    cat: ["verified"],
    name: "Inês Duarte",
    creatorId: "ines",
    avatar: avatar(14587417),
    verified: true,
    text: "sent you a locked message",
    time: "12m",
    unread: true,
    media: photo(14587417, 240, 240),
    locked: true,
    tag: "120 Coins",
    action: "Unlock",
  },
  {
    id: "n4",
    kind: "tip",
    tone: "gold",
    day: "today",
    cat: [],
    name: "Kofi Mensah",
    creatorId: "kofi",
    avatar: avatar(7562076),
    text: "tipped you 250 Coins on “Late tape, side B”",
    time: "22m",
    unread: true,
    tag: "+250",
  },
  {
    id: "n5",
    kind: "follow",
    tone: "brand",
    day: "today",
    cat: ["follows", "verified"],
    name: "Amara Osei",
    creatorId: "amara",
    avatar: avatar(11701102),
    verified: true,
    text: "subscribed to your Gold tier",
    time: "40m",
    unread: true,
    action: "Say hi",
  },
  {
    id: "n6",
    kind: "comment",
    tone: "ink",
    day: "today",
    cat: ["comments", "verified"],
    name: "Sana Iqbal",
    creatorId: "sana",
    avatar: avatar(3756907),
    verified: true,
    text: "replied to your comment",
    quote: "“the lighting in this set is unreal — how?”",
    time: "1h",
    unread: false,
  },
  {
    id: "n7",
    kind: "mention",
    tone: "ink",
    day: "today",
    cat: ["comments"],
    name: "Lucas Ferreira",
    creatorId: "lucas",
    avatar: avatar(33148747),
    text: "mentioned you in a comment",
    quote: "“shot with @maya.makes — she runs the room”",
    time: "2h",
    unread: false,
  },
  {
    id: "n8",
    kind: "follow",
    tone: "brand",
    day: "today",
    cat: ["follows"],
    name: "Rhea Kapoor",
    creatorId: "rhea",
    avatar: avatar(9489925),
    text: "started following you",
    time: "3h",
    unread: false,
    action: "Follow back",
  },
  {
    id: "n9",
    kind: "verified",
    tone: "brand",
    day: "earlier",
    cat: [],
    name: "Trust & Safety",
    system: true,
    text: "ID verification approved — your badge is live",
    time: "Yesterday",
    unread: true,
    tag: "Verified",
  },
  {
    id: "n10",
    kind: "renewal",
    tone: "ink",
    day: "earlier",
    cat: ["verified"],
    name: "Noor Adeyemi",
    creatorId: "noor",
    avatar: avatar(35240848),
    verified: true,
    text: "membership renews 18 Sep · 5 Coins/mo",
    time: "Yesterday",
    unread: false,
    action: "Manage",
  },
  {
    id: "n11",
    kind: "payout",
    tone: "gold",
    day: "earlier",
    cat: [],
    name: "Payouts",
    system: true,
    text: "12,400 Coins paid out to HDFC ••4417",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "n12",
    kind: "shield",
    tone: "rose",
    day: "earlier",
    cat: [],
    name: "Moderation",
    system: true,
    text: "One post is hidden pending review",
    time: "2d",
    unread: false,
    action: "Review",
  },
  {
    id: "n13",
    kind: "security",
    tone: "ink",
    day: "earlier",
    cat: [],
    name: "Security",
    system: true,
    text: "New login · Chrome on Windows, Mumbai",
    time: "2d",
    unread: false,
  },
  {
    id: "n14",
    kind: "promo",
    tone: "gold",
    day: "earlier",
    cat: [],
    name: "Your bundle",
    system: true,
    text: "20% off 3-month bundle expires tonight",
    time: "3d",
    unread: false,
    tag: "Ends 11:59pm",
  },
];

