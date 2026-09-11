import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Menu, X } from 'lucide-react';

interface NavigationProps {
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F8F6F2]/90 backdrop-blur-md border-b border-[#E8E5E0] shadow-sm py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Wordmark */}
          <a href="#" className="flex items-center gap-2 group flex-shrink-0">
            <span className="font-serif text-2xl sm:text-3xl font-light tracking-[0.28em] text-[#111111] uppercase transition-opacity group-hover:opacity-80">
              LUXE
            </span>
          </a>

          {/* Center Navigation Links & Search Pill */}
          <div className="hidden lg:flex items-center gap-6 flex-1 max-w-2xl mx-6">
            <nav className="flex items-center gap-1 bg-[#EFECE6]/80 p-1 rounded-full border border-[#E4E0D8]">
              <a
                href="#explore"
                className="px-3.5 py-1.5 text-xs font-medium text-[#111111] bg-white rounded-full shadow-xs transition-all hover:bg-white/90"
              >
                Explore
              </a>
              <a
                href="#creators"
                className="px-3.5 py-1.5 text-xs font-medium text-[#6E6E6E] rounded-full transition-colors hover:text-[#111111]"
              >
                Creators
              </a>
              <a
                href="#niches"
                className="px-3.5 py-1.5 text-xs font-medium text-[#6E6E6E] rounded-full transition-colors hover:text-[#111111]"
              >
                Community
              </a>
              <a
                href="#why-luxe"
                className="px-3.5 py-1.5 text-xs font-medium text-[#6E6E6E] rounded-full transition-colors hover:text-[#111111]"
              >
                About
              </a>
            </nav>

            {/* Pill Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators, categories, or content..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#EFECE6]/60 border border-[#E2DED6] rounded-full text-[#111111] placeholder:text-[#8C8C8C] focus:outline-none focus:bg-white focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onOpenAuth?.('login')}
              className="px-4 py-2 text-xs font-medium text-[#111111] hover:text-[#6E6E6E] transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth?.('signup')}
              className="px-5 py-2 text-xs font-medium text-white bg-[#111111] hover:bg-[#2B2B2B] rounded-full transition-all shadow-sm hover:shadow-md active:scale-98 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#E8E5E0]" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#111111] hover:bg-[#EFECE6] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 bg-white/95 backdrop-blur-xl border border-[#E8E5E0] rounded-2xl shadow-luxury flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
              <input
                type="text"
                placeholder="Search creators..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F6F2] border border-[#E8E5E0] rounded-full text-[#111111] focus:outline-none"
              />
            </div>
            <a
              href="#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#F8F6F2] rounded-lg"
            >
              Explore
            </a>
            <a
              href="#creators"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#F8F6F2] rounded-lg"
            >
              Featured Creators
            </a>
            <a
              href="#niches"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#F8F6F2] rounded-lg"
            >
              Every Niche
            </a>
            <a
              href="#why-luxe"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#F8F6F2] rounded-lg"
            >
              Why LUXE
            </a>
            <div className="pt-3 border-t border-[#E8E5E0] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth?.('login');
                }}
                className="flex-1 py-2 text-xs font-medium text-[#111111] border border-[#E8E5E0] rounded-full"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth?.('signup');
                }}
                className="flex-1 py-2 text-xs font-medium text-white bg-[#111111] rounded-full"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
