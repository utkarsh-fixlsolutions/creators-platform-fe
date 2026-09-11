import React from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Lock,
  Radio,
  Clock
} from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { useNavigate } from 'react-router-dom';

export const StudioOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { availableCredits, pendingCredits, lifetimeEarned } = useWalletStore();

  const metrics = [
    {
      label: 'Available Earnings',
      value: `$${(availableCredits / 100).toFixed(2)}`,
      change: '+18.4% vs last week',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      subtext: 'Ready for instant payout withdrawal',
    },
    {
      label: '7-Day Pending Hold',
      value: `$${(pendingCredits / 100).toFixed(2)}`,
      change: '14 new transactions',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      subtext: 'Clearing automatically after dispute buffer',
    },
    {
      label: 'Active Subscribers',
      value: '284',
      change: '+12 this month',
      icon: <Users className="w-5 h-5 text-[#4F46E5]" />,
      subtext: 'MRR: $3,420.00 / month',
    },
    {
      label: 'Lifetime Volume',
      value: `$${(lifetimeEarned / 100).toFixed(2)}`,
      change: '99.4% payout health',
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      subtext: 'Total earned across PPVs, tips & tiers',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border border-[#E8E5E0] shadow-luxury flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#7A7772] uppercase font-mono">{m.label}</span>
                <div className="p-2 rounded-xl bg-[#F8F6F2] border border-[#EAE5DC]">
                  {m.icon}
                </div>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight mb-1">
                {m.value}
              </h3>

              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{m.change}</span>
              </p>
            </div>

            <p className="text-[11px] text-[#8C8C8C] mt-4 pt-3 border-t border-[#F0ECE4]">
              {m.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Launchpad & Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Action Launchpad */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
              CREATOR ACTIONS
            </span>
            <h3 className="font-serif text-2xl text-[#111111] mt-1 mb-4">Publish & Monetize</h3>
            <p className="text-xs text-[#6E6E6E] mb-6 leading-relaxed">
              Upload exclusive content, launch mass PPV broadcast messages to subscribers, or start a zero-latency WebRTC live stream.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/studio/create')}
                className="w-full p-4 rounded-2xl bg-[#F8F6F2] hover:bg-[#EFECE6] border border-[#E8E5E0] flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E5E0] flex items-center justify-center text-[#111111]">
                    <Lock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#111111]">Create Paywalled Post</h4>
                    <p className="text-[11px] text-[#7A7772]">Set PPV price or gate by subscriber tier</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8C8C8C] group-hover:text-[#111111] transition-colors" />
              </button>

              <button
                onClick={() => navigate('/studio/broadcast')}
                className="w-full p-4 rounded-2xl bg-[#F8F6F2] hover:bg-[#EFECE6] border border-[#E8E5E0] flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E5E0] flex items-center justify-center text-[#111111]">
                    <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#111111]">Send Mass PPV Broadcast</h4>
                    <p className="text-[11px] text-[#7A7772]">Filter by tier or 30-day lapsed patrons</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8C8C8C] group-hover:text-[#111111] transition-colors" />
              </button>

              <button
                onClick={() => navigate('/studio/live')}
                className="w-full p-4 rounded-2xl bg-[#F8F6F2] hover:bg-[#EFECE6] border border-[#E8E5E0] flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E5E0] flex items-center justify-center text-[#111111]">
                    <Radio className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#111111]">Start Live Room</h4>
                    <p className="text-[11px] text-[#7A7772]">Low-latency broadcast with real-time gifts</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8C8C8C] group-hover:text-[#111111] transition-colors" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0ECE4] text-[11px] text-[#8C8C8C] flex items-center justify-between">
            <span>Identity: §2257 Verified</span>
            <span className="text-emerald-600 font-semibold">Active Standing</span>
          </div>
        </div>

        {/* Right Column: Top Performing Content & PPV Unlocks */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
                MONETIZATION REVENUE
              </span>
              <h3 className="font-serif text-2xl text-[#111111]">Top Revenue Streams</h3>
            </div>
            <button
              onClick={() => navigate('/studio/earnings')}
              className="text-xs font-medium text-[#111111] hover:underline"
            >
              Full Ledger ↗
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'HIIT & Core Masterclass (4K Video)',
                type: 'PPV Media Post',
                unlocked: '142 unlocks',
                revenue: '$710.00',
                date: 'Sep 09, 2026',
              },
              {
                title: 'VIP Patron Subscriptions',
                type: 'Monthly Recurring (Tier 2)',
                unlocked: '88 active patrons',
                revenue: '$2,199.12',
                date: 'Sep 01 - Present',
              },
              {
                title: 'Live Stream Gifting Shower',
                type: 'Live Session #42',
                unlocked: '310 gifts received',
                revenue: '$485.50',
                date: 'Sep 07, 2026',
              },
              {
                title: 'Summer Positano Lookbook Audio Diary',
                type: 'Broadcast Message',
                unlocked: '64 unlocks',
                revenue: '$320.00',
                date: 'Sep 04, 2026',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DE] flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-semibold text-[#111111]">{item.title}</h4>
                  <p className="text-[11px] text-[#7A7772] mt-0.5">
                    {item.type} • <span className="text-[#111111] font-medium">{item.unlocked}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-[#111111]">{item.revenue}</span>
                  <p className="text-[10px] text-[#8C8C8C] mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
