import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface NavigationProps {
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onOpenAuth?.('login')}
              className="px-4 py-2 text-xs font-semibold text-[#111111] hover:text-[#6E6E6E] transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth?.('signup')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#2B2B2B] rounded-full transition-all shadow-sm hover:shadow-md active:scale-98 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#E8E5E0]" />
              <span>Sign Up</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
