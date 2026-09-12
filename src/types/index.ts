export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage: string;
  category: string;
  subcategories: string[];
  isVerified: boolean;
  status: 'online' | 'live' | 'offline';
  likes: string;
  monthlyPrice: string;
  bio: string;
  socials: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Niche {
  id: string;
  name: string;
  headline: string;
  tagline: string;
  leftImage: string;
  leftCreator: string;
  leftCategory: string;
  rightImage: string;
  rightCreator: string;
  rightCategory: string;
}

export interface StoryCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  tag: string;
}

export interface MetricItem {
  id: string;
  targetValue: number;
  prefix?: string;
  suffix: string;
  label: string;
  sublabel: string;
}
