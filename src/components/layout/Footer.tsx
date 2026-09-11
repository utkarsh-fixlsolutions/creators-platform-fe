import React from 'react';
import { Instagram, Twitter, Disc as Discord, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F2EFE9] text-[#111111] pt-12 pb-10 border-t border-[#E5E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 mb-10">
          
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2">
            <span className="font-serif text-2xl font-light tracking-[0.25em] text-[#111111] uppercase block mb-4">
              LUXE
            </span>
            <p className="text-xs text-[#6E6E6E] max-w-sm leading-relaxed mb-6 font-normal">
              An editorial ecosystem designed for creative craft, intimate community, and meaningful patron support.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111111] border border-[#E0DDD5] hover:bg-[#111111] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111111] border border-[#E0DDD5] hover:bg-[#111111] hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111111] border border-[#E0DDD5] hover:bg-[#111111] hover:text-white transition-colors"
                aria-label="Discord"
              >
                <Discord className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111111] border border-[#E0DDD5] hover:bg-[#111111] hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] font-mono mb-4">
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-xs text-[#666666]">
              <li><a href="#explore" className="hover:text-[#111111] transition-colors">Explore Feed</a></li>
              <li><a href="#creators" className="hover:text-[#111111] transition-colors">Featured Creators</a></li>
              <li><a href="#niches" className="hover:text-[#111111] transition-colors">Categories & Niches</a></li>
              <li><a href="#why-luxe" className="hover:text-[#111111] transition-colors">Live Streaming</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">Creator Studio</a></li>
            </ul>
          </div>

          {/* Col 3: Company Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] font-mono mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-[#666666]">
              <li><a href="#" className="hover:text-[#111111] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">Brand Editorial</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">Press & Media</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] font-mono mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-[#666666]">
              <li><a href="#" className="hover:text-[#111111] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">18 U.S.C. § 2257</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">Discreet Billing Notice</a></li>
              <li><a href="#" className="hover:text-[#111111] transition-colors">Security Standards</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#85827D]">
          <p>© {new Date().getFullYear()} LUXE Platform Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Designed with elegance & discretion</span>
            <span>•</span>
            <span>Status: Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
