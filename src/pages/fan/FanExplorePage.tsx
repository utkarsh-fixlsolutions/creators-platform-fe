import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { featuredCreators } from '../../data/creatorsData';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { NavLink } from 'react-router-dom';

export const FanExplorePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const tags = ['All', 'Lifestyle', 'Fitness', 'Gaming', 'Art', 'Music', 'Fashion', 'Photography'];

  const filteredCreators = featuredCreators.filter((c) => {
    const matchesTag = selectedTag === 'All' || c.category === selectedTag || c.subcategories.includes(selectedTag);
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
          SEARCH & DISCOVERY (PART B4)
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#111111] mt-1 mb-2">
          Explore Curated Creators
        </h1>
        <p className="text-xs text-[#6E6E6E] mb-6">
          Find independent creators sharing exclusive craft, masterclasses, and stories.
        </p>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by creator name, craft, or category..."
            className="w-full pl-11 pr-4 py-3 text-xs bg-[#F8F6F2] border border-[#E0DCD3] rounded-2xl text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] transition-all"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-[#F2EFE9] text-[#6E6E6E] hover:text-[#111111] hover:bg-[#EAE5DC]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Creator Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredCreators.map((creator) => (
          <NavLink
            key={creator.id}
            to={`/app/@${creator.handle.replace('@', '')}`}
            className="bg-white rounded-3xl p-5 border border-[#E8E5E0] shadow-luxury hover:shadow-luxury-hover transition-all group flex flex-col justify-between"
          >
            <div>
              {/* Creator Thumbnail with Status */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F0EDE6] mb-4 border border-[#E8E5E0]">
                <img
                  src={creator.coverImage}
                  alt={creator.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-medium text-[#111111] flex items-center gap-1.5 shadow-xs">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      creator.status === 'online'
                        ? 'bg-emerald-500'
                        : creator.status === 'live'
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-zinc-400'
                    }`}
                  />
                  <span className="capitalize">{creator.status}</span>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-serif text-xl font-normal text-[#111111] group-hover:underline">
                  {creator.name}
                </h3>
                <VerifiedBadge size={15} />
              </div>

              <p className="text-[11px] text-[#7A7772] font-medium mb-2">
                {creator.subcategories.join(' • ')}
              </p>

              <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-4">
                {creator.bio}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F0ECE4] flex items-center justify-between text-xs font-semibold text-[#111111]">
              <span>From {creator.monthlyPrice}</span>
              <span className="flex items-center gap-1 text-[#111111] group-hover:translate-x-1 transition-transform">
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </NavLink>
        ))}
      </div>

    </div>
  );
};
