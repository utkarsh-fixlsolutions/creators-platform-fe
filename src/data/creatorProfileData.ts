const photo = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export interface ProfilePost {
  id: string;
  thumb: string;
  fullImage: string;
  isVideo?: boolean;
  duration?: string;
  locked?: boolean;
  caption?: string;
  likes?: number;
}

export interface CreatorProfileData {
  id: string;
  name: string;
  handle: string;
  category: string;
  cover: string;
  avatar: string;
  verified: boolean;
  fans: number;
  since: string;
  bio: string;
  tier: string;
  price: number;
  perks: string[];
  photos: ProfilePost[];
  videos: ProfilePost[];
  vault: ProfilePost[];
}

export const CREATOR_PROFILES: Record<string, CreatorProfileData> = {
  "noor.clay": {
    id: "noor",
    name: "Noor Adeyemi",
    handle: "noor.clay",
    category: "Ceramics",
    cover: photo(6693557, 1200, 500),
    avatar: photo(35240848, 200, 200),
    verified: true,
    fans: 84300,
    since: "Mar 2023",
    bio: "Wheel-thrown stoneware and glaze tests from a small studio outside Lisbon. New pieces most weeks — vault gets the seconds and behind-the-scenes firings.",
    tier: "Gold Membership",
    price: 5,
    perks: [
      "Weekly glazing videos & throwing logs",
      "Early access to monthly kiln drops",
      "Vault: seconds, studio archive & glaze recipes"
    ],
    photos: [
      { id: "p1", thumb: photo(6693557, 400, 400), fullImage: photo(6693557, 1200, 900), caption: "Fresh batch of speckled stoneware cups" },
      { id: "p2", thumb: photo(5904069, 400, 400), fullImage: photo(5904069, 1200, 900), caption: "Raw clay trimming station" },
      { id: "p3", thumb: photo(9489925, 400, 400), fullImage: photo(9489925, 1200, 900), caption: "Earthy matte celadon glaze tests" },
      { id: "p4", thumb: photo(11701102, 400, 400), fullImage: photo(11701102, 1200, 900), caption: "Ribbed vases drying in morning light" },
      { id: "p5", thumb: photo(2992517, 400, 400), fullImage: photo(2992517, 1200, 900), caption: "Studio corner with natural lighting" },
      { id: "p6", thumb: photo(33680674, 400, 400), fullImage: photo(33680674, 1200, 900), caption: "Handmade ceramic pour-over set" },
      { id: "p7", thumb: photo(13912725, 400, 400), fullImage: photo(13912725, 1200, 900), caption: "Kiln shelf loading before bisque firing" },
      { id: "p8", thumb: photo(21849467, 400, 400), fullImage: photo(21849467, 1200, 900), caption: "Organic sculpted handles & rim detail" },
      { id: "p9", thumb: photo(9489925, 400, 400), fullImage: photo(9489925, 1200, 900), caption: "Completed stoneware tea collection" }
    ],
    videos: [
      { id: "v1", thumb: photo(7562076, 400, 400), fullImage: photo(7562076, 1200, 900), isVideo: true, duration: "3:14", caption: "Centering 4kg of dark stoneware on the wheel" },
      { id: "v2", thumb: photo(3756907, 400, 400), fullImage: photo(3756907, 1200, 900), isVideo: true, duration: "4:28", caption: "Trimming delicate foot rings with tungsten tools" },
      { id: "v3", thumb: photo(33148747, 400, 400), fullImage: photo(33148747, 1200, 900), isVideo: true, duration: "5:42", caption: "Ash & cobalt glaze mixing session" },
      { id: "v4", thumb: photo(14807440, 400, 400), fullImage: photo(14807440, 1200, 900), isVideo: true, duration: "2:50", caption: "Gas reduction kiln firing timelapse" },
      { id: "v5", thumb: photo(14587417, 400, 400), fullImage: photo(14587417, 1200, 900), isVideo: true, duration: "6:15", caption: "Studio Q&A: Tools, clay bodies & inspiration" },
      { id: "v6", thumb: photo(6693557, 400, 400), fullImage: photo(6693557, 1200, 900), isVideo: true, duration: "1:45", caption: "Unloading the reduction kiln: Results" }
    ],
    vault: [
      { id: "vl1", thumb: photo(35240848, 400, 400), fullImage: photo(35240848, 1200, 900), locked: true, caption: "Private Glaze Formulation Book (PDF + Videos)" },
      { id: "vl2", thumb: photo(5904069, 400, 400), fullImage: photo(5904069, 1200, 900), locked: true, caption: "Studio Seconds: Exclusive Private Sale Catalog" },
      { id: "vl3", thumb: photo(9489925, 400, 400), fullImage: photo(9489925, 1200, 900), locked: true, caption: "Raw Studio Audio: Wheel sessions & rain in Lisbon" },
      { id: "vl4", thumb: photo(11701102, 400, 400), fullImage: photo(11701102, 1200, 900), locked: true, caption: "Unreleased Masterpiece: Sculptural Totem series" },
      { id: "vl5", thumb: photo(2992517, 400, 400), fullImage: photo(2992517, 1200, 900), locked: true, caption: "High-Res Desktop Wallpapers & Print Files" },
      { id: "vl6", thumb: photo(33680674, 400, 400), fullImage: photo(33680674, 1200, 900), locked: true, caption: "Private Discord Studio Passcode & Link" }
    ]
  },

  "ines.draws": {
    id: "ines",
    name: "Inês Duarte",
    handle: "ines.draws",
    category: "Illustration",
    cover: photo(5904069, 1200, 500),
    avatar: photo(14587417, 200, 200),
    verified: true,
    fans: 212000,
    since: "Jan 2022",
    bio: "Visual storyteller & editorial illustrator exploring surrealist flora, botanical dreams, and gouache portraits.",
    tier: "Atelier Patron",
    price: 6,
    perks: [
      "Layered Procreate files (.procreate) & brushes",
      "Full process real-time painting timelapses",
      "Exclusive 4K wallpaper editions every month"
    ],
    photos: [
      { id: "p1", thumb: photo(14587417, 400, 400), fullImage: photo(14587417, 1200, 900), caption: "Botanical dreamscape in gouache" },
      { id: "p2", thumb: photo(5904069, 400, 400), fullImage: photo(5904069, 1200, 900), caption: "Flora and shadow series" },
      { id: "p3", thumb: photo(9489925, 400, 400), fullImage: photo(9489925, 1200, 900), caption: "Sketchbook character studies" },
      { id: "p4", thumb: photo(11701102, 400, 400), fullImage: photo(11701102, 1200, 900), caption: "Midnight garden palette" }
    ],
    videos: [
      { id: "v1", thumb: photo(3756907, 400, 400), fullImage: photo(3756907, 1200, 900), isVideo: true, duration: "8:10", caption: "Color harmony masterclass" },
      { id: "v2", thumb: photo(7562076, 400, 400), fullImage: photo(7562076, 1200, 900), isVideo: true, duration: "5:22", caption: "Gouache texture layering demo" }
    ],
    vault: [
      { id: "vl1", thumb: photo(14587417, 400, 400), fullImage: photo(14587417, 1200, 900), locked: true, caption: "Complete 2026 Custom Brush Pack" },
      { id: "vl2", thumb: photo(5904069, 400, 400), fullImage: photo(5904069, 1200, 900), locked: true, caption: "Full-Res PSD Layers Archive" }
    ]
  },

  "theo.shoots": {
    id: "theo",
    name: "Theo Marchetti",
    handle: "theo.shoots",
    category: "Photography",
    cover: photo(14807440, 1200, 500),
    avatar: photo(14807440, 200, 200),
    verified: true,
    fans: 97400,
    since: "May 2023",
    bio: "Cinematic portraiture, medium format film experiments, and raw color recipes. Capturing mood in Milan.",
    tier: "Film Archive Pass",
    price: 5,
    perks: [
      "Custom 35mm & 120 film Lightroom presets",
      "Raw photo breakdown sessions & lighting maps",
      "Behind-the-scenes video shoots & contact sheets"
    ],
    photos: [
      { id: "p1", thumb: photo(14807440, 400, 400), fullImage: photo(14807440, 1200, 900), caption: "Milan dusk in 35mm film" },
      { id: "p2", thumb: photo(6693557, 400, 400), fullImage: photo(6693557, 1200, 900), caption: "Editorial studio lighting test" },
      { id: "p3", thumb: photo(9489925, 400, 400), fullImage: photo(9489925, 1200, 900), caption: "Natural window light portrait" }
    ],
    videos: [
      { id: "v1", thumb: photo(33148747, 400, 400), fullImage: photo(33148747, 1200, 900), isVideo: true, duration: "4:50", caption: "Color grading in DaVinci Resolve" }
    ],
    vault: [
      { id: "vl1", thumb: photo(14807440, 400, 400), fullImage: photo(14807440, 1200, 900), locked: true, caption: "All 12 Analog Presets Pack (.xmp)" },
      { id: "vl2", thumb: photo(6693557, 400, 400), fullImage: photo(6693557, 1200, 900), locked: true, caption: "Complete Uncompressed RAW Gallery" }
    ]
  }
};

export function getCreatorProfile(handleParam?: string): CreatorProfileData {
  if (!handleParam) return CREATOR_PROFILES["noor.clay"];
  const clean = handleParam.replace(/^@/, "").toLowerCase().trim();

  // Exact match
  if (CREATOR_PROFILES[clean]) {
    return CREATOR_PROFILES[clean];
  }

  // Handle aliases or partial matching
  const foundKey = Object.keys(CREATOR_PROFILES).find((k) =>
    k.includes(clean) || clean.includes(k)
  );
  if (foundKey) {
    return CREATOR_PROFILES[foundKey];
  }

  // Dynamic fallback profile generated with the handle
  return {
    id: clean,
    name: clean.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    handle: clean,
    category: "Featured Creator",
    cover: photo(6693557, 1200, 500),
    avatar: photo(35240848, 200, 200),
    verified: true,
    fans: 42800,
    since: "Jun 2023",
    bio: `Welcome to @${clean}'s creative studio. Explore exclusive photo sets, masterclass tutorials, and locked vault releases.`,
    tier: "Studio Membership",
    price: 5,
    perks: [
      "Access to all subscriber-only posts",
      "Direct message priority reply",
      "Unlocked vault & archive library"
    ],
    photos: CREATOR_PROFILES["noor.clay"].photos,
    videos: CREATOR_PROFILES["noor.clay"].videos,
    vault: CREATOR_PROFILES["noor.clay"].vault
  };
}
