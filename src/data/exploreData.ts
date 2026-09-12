const photo = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export interface ExploreCreator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  coverHeight: number;
  category: string;
  fans: number;
  verified?: boolean;
  following: boolean;
  price?: number;
  portfolio: string[];
}

export const EXPLORE_CATEGORIES = [
  "All",
  "Ceramics",
  "Illustration",
  "Photography",
  "Music",
  "Travel film",
  "Fashion",
  "Painting",
  "Woodworking",
  "Dance",
  "Writing",
  "Food",
] as const;

export type ExploreCategory = (typeof EXPLORE_CATEGORIES)[number];

export const INITIAL_EXPLORE_CREATORS: ExploreCreator[] = [
  {
    id: "noor",
    name: "Noor Adeyemi",
    handle: "noor.clay",
    avatar: photo(35240848, 160, 160),
    cover: photo(6693557, 600, 420),
    coverHeight: 250,
    category: "Ceramics",
    fans: 84_300,
    verified: true,
    following: true,
    price: 5,
    portfolio: [
      photo(6693557, 200, 200),
      photo(5904069, 200, 200),
      photo(9489925, 200, 200),
    ],
  },
  {
    id: "ines",
    name: "Inês Duarte",
    handle: "ines.draws",
    avatar: photo(14587417, 160, 160),
    cover: photo(5904069, 600, 480),
    coverHeight: 320,
    category: "Illustration",
    fans: 212_000,
    verified: true,
    following: false,
    portfolio: [
      photo(5904069, 200, 200),
      photo(9489925, 200, 200),
      photo(14807440, 200, 200),
    ],
  },
  {
    id: "theo",
    name: "Theo Marchetti",
    handle: "theo.shoots",
    avatar: photo(14807440, 160, 160),
    cover: photo(14807440, 600, 440),
    coverHeight: 280,
    category: "Photography",
    fans: 97_400,
    verified: true,
    following: true,
    price: 5,
    portfolio: [
      photo(14807440, 200, 200),
      photo(35240848, 200, 200),
      photo(14587417, 200, 200),
    ],
  },
  {
    id: "kofi",
    name: "Kofi Mensah",
    handle: "kofi.wav",
    avatar: photo(7562076, 160, 160),
    cover: photo(7562076, 600, 360),
    coverHeight: 210,
    category: "Music",
    fans: 61_200,
    verified: false,
    following: true,
    price: 4,
    portfolio: [
      photo(7562076, 200, 200),
      photo(3756907, 200, 200),
      photo(11701102, 200, 200),
    ],
  },
  {
    id: "sana",
    name: "Sana Iqbal",
    handle: "sana.roams",
    avatar: photo(3756907, 160, 160),
    cover: photo(3756907, 600, 520),
    coverHeight: 340,
    category: "Travel film",
    fans: 320_000,
    verified: true,
    following: false,
    portfolio: [
      photo(3756907, 200, 200),
      photo(11701102, 200, 200),
      photo(33148747, 200, 200),
    ],
  },
  {
    id: "amara",
    name: "Amara Osei",
    handle: "amara.atelier",
    avatar: photo(11701102, 160, 160),
    cover: photo(11701102, 600, 420),
    coverHeight: 260,
    category: "Fashion",
    fans: 148_000,
    verified: true,
    following: false,
    price: 6,
    portfolio: [
      photo(11701102, 200, 200),
      photo(2992517, 200, 200),
      photo(33680674, 200, 200),
    ],
  },
  {
    id: "jade",
    name: "Jade Lin",
    handle: "jade.paints",
    avatar: photo(2992517, 160, 160),
    cover: photo(2992517, 600, 460),
    coverHeight: 300,
    category: "Painting",
    fans: 48_100,
    verified: false,
    following: false,
    portfolio: [
      photo(2992517, 200, 200),
      photo(33680674, 200, 200),
      photo(13912725, 200, 200),
    ],
  },
  {
    id: "marcus",
    name: "Marcus Bell",
    handle: "marcus.woodwork",
    avatar: photo(33680674, 160, 160),
    cover: photo(33680674, 600, 380),
    coverHeight: 230,
    category: "Woodworking",
    fans: 22_700,
    verified: false,
    following: false,
    price: 3,
    portfolio: [
      photo(33680674, 200, 200),
      photo(13912725, 200, 200),
      photo(21849467, 200, 200),
    ],
  },
  {
    id: "valentina",
    name: "Valentina Ruiz",
    handle: "vale.dances",
    avatar: photo(13912725, 160, 160),
    cover: photo(13912725, 600, 450),
    coverHeight: 290,
    category: "Dance",
    fans: 131_000,
    verified: true,
    following: false,
    price: 7,
    portfolio: [
      photo(13912725, 200, 200),
      photo(21849467, 200, 200),
      photo(33148747, 200, 200),
    ],
  },
  {
    id: "priya",
    name: "Priya Nair",
    handle: "priya.writes",
    avatar: photo(21849467, 160, 160),
    cover: photo(21849467, 600, 400),
    coverHeight: 240,
    category: "Writing",
    fans: 17_900,
    verified: false,
    following: false,
    portfolio: [
      photo(21849467, 200, 200),
      photo(9489925, 200, 200),
      photo(6693557, 200, 200),
    ],
  },
  {
    id: "lucas",
    name: "Lucas Ferreira",
    handle: "lucas.cooks",
    avatar: photo(33148747, 160, 160),
    cover: photo(33148747, 600, 470),
    coverHeight: 310,
    category: "Food",
    fans: 56_900,
    verified: false,
    following: true,
    price: 4,
    portfolio: [
      photo(33148747, 200, 200),
      photo(6693557, 200, 200),
      photo(5904069, 200, 200),
    ],
  },
  {
    id: "rhea",
    name: "Rhea Kapoor",
    handle: "rhea.design",
    avatar: photo(9489925, 160, 160),
    cover: photo(9489925, 600, 420),
    coverHeight: 260,
    category: "Fashion",
    fans: 39_500,
    verified: true,
    following: false,
    portfolio: [
      photo(9489925, 200, 200),
      photo(14807440, 200, 200),
      photo(35240848, 200, 200),
    ],
  },
];
