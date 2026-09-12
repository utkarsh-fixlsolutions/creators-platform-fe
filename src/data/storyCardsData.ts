import { StoryCard, MetricItem } from '../types';

export const storyCardsData: StoryCard[] = [
  {
    id: 'private-connections',
    title: 'Private Connections',
    subtitle: 'Direct, Meaningful Access',
    description: 'Foster genuine 1-on-1 relationships with encrypted messaging, private audio notes, and dedicated priority threads.',
    iconName: 'MessageSquare',
    tag: 'Intimacy'
  },
  {
    id: 'premium-memberships',
    title: 'Custom Memberships',
    subtitle: 'Tailored Patron Tiers',
    description: 'Design multi-tiered subscription levels with curated perks, early-access media drops, and private vault privileges.',
    iconName: 'Sparkles',
    tag: 'Community'
  },
  {
    id: 'live-streaming',
    title: 'Interactive Live Rooms',
    subtitle: 'Low-Latency Real-Time Audio & Video',
    description: 'Host intimate live sessions, community masterclasses, and real-time interactive Q&As with zero broadcast delay.',
    iconName: 'Radio',
    tag: 'Experience'
  },
  {
    id: 'creator-first',
    title: 'Creator Ownership',
    subtitle: 'Your Audience, Your Terms',
    description: 'Keep full ownership of your catalog, subscriber relationships, and analytics without algorithmic censorship.',
    iconName: 'Crown',
    tag: 'Autonomy'
  },
  {
    id: 'secure-payments',
    title: 'Discreet & Secure',
    subtitle: 'Bank-Grade Financial Rails',
    description: 'Enjoy automated weekly payouts, transparent fees, and discreet billing descriptors backed by PCI-DSS Level 1 compliance.',
    iconName: 'ShieldCheck',
    tag: 'Trust'
  }
];

export const metricsData: MetricItem[] = [
  {
    id: 'creators',
    targetValue: 500,
    suffix: 'K+',
    label: 'Curated Creators',
    sublabel: 'Sharing exclusive craft worldwide'
  },
  {
    id: 'members',
    targetValue: 10,
    suffix: 'M+',
    label: 'Engaged Members',
    sublabel: 'Supporting creators they love'
  },
  {
    id: 'countries',
    targetValue: 150,
    suffix: '+',
    label: 'Countries Active',
    sublabel: 'A truly global community'
  },
  {
    id: 'paid-out',
    prefix: '$',
    targetValue: 250,
    suffix: 'M+',
    label: 'Earned by Creators',
    sublabel: 'Paid out directly and reliably'
  }
];
