import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Film,
  MessageSquare,
  Radio,
  Coins,
  Search,
  Bell,
  Sparkles,
  LogOut,
  ChevronDown,
  Layers,
  Plus
} from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useWalletStore } from '../../store/walletStore';
import { motion, AnimatePresence } from 'framer-motion';

export const FanAppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, switchActiveRole } = useSessionStore();
  const { coinsBalance, topUpCoins } = useWalletStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleSwitchToStudio = () => {
    switchActiveRole('creator');
    setProfileDropdownOpen(false);
    navigate('/studio');
  };

  const navItems = [
    { label: 'Feed', path: '/app', icon: <Layers className="w-4 h-4" /> },
    { label: 'Explore', path: '/app/explore', icon: <Compass className="w-4 h-4" /> },
    { label: 'Clips', path: '/app/clips', icon: <Film className="w-4 h-4" /> },
    { label: 'Live', path: '/app/live', icon: <Radio className="w-4 h-4" /> },
    { label: 'Messages', path: '/app/messages', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-[#111111] flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E5E0] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Primary Nav Links */}
          <div className="flex items-center gap-8">
            <NavLink to="/app" className="font-serif text-2xl font-light tracking-[0.25em] text-[#111111] uppercase">
              LUXE
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#F5F2EB] p-1 rounded-full border border-[#EBE6DC]">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white text-[#111111] shadow-xs'
                        : 'text-[#6E6E6E] hover:text-[#111111]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Search Pill */}
          <div className="hidden lg:flex items-center relative w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
            <input
              type="text"
              placeholder="Search creators & tags..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F5F2EB] border border-[#E8E5E0] rounded-full text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] transition-all"
            />
          </div>

          {/* Right Area: Coin Balance, Notifications & User Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Coin Balance Chip */}
            <button
              onClick={() => setWalletModalOpen(true)}
              className="px-3 py-1.5 bg-[#EDE9DE] hover:bg-[#E2DDD0] border border-[#E0DCD3] rounded-full text-xs font-semibold text-[#111111] flex items-center gap-1.5 transition-all shadow-2xs group"
              title="Click to buy more Coins"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{coinsBalance} Coins</span>
              <div className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] ml-1 group-hover:scale-110 transition-transform">
                <Plus className="w-2.5 h-2.5" />
              </div>
            </button>

            {/* Notification Bell */}
            <button
              className="p-2 rounded-full text-[#6E6E6E] hover:text-[#111111] hover:bg-[#EDE9DE] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#EDE9DE] transition-colors"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'}
                  alt={user?.displayName || 'User Avatar'}
                  className="w-8 h-8 rounded-full object-cover border border-[#E8E5E0]"
                />
                <ChevronDown className="w-3.5 h-3.5 text-[#6E6E6E]" />
              </button>

              {/* Profile Menu Popup */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-luxury border border-[#E8E5E0] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#F0ECE4] mb-2">
                    <p className="text-xs font-semibold text-[#111111]">{user?.displayName}</p>
                    <p className="text-[11px] text-[#7A7772]">@{user?.handle}</p>
                  </div>

                  {/* Switch to Creator Studio Button */}
                  <button
                    onClick={handleSwitchToStudio}
                    className="w-full px-3 py-2 text-xs font-medium text-left rounded-xl bg-[#F5F2EB] hover:bg-[#EAE5DC] text-[#111111] flex items-center justify-between mb-2 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Creator Studio</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono text-[#8C8C8C]">Workspace ↗</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setWalletModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-xs text-left text-[#555555] hover:text-[#111111] hover:bg-[#F8F6F2] rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Coin Wallet & Receipts</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full px-3 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 mt-2 pt-2 border-t border-[#F0ECE4]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Fan Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <Outlet />
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E5E0] py-2 px-6 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#111111]' : 'text-[#8C8C8C]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Coin Wallet Purchase Modal */}
      <AnimatePresence>
        {walletModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWalletModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-2xl text-[#111111]">Coin Wallet</h3>
                  <p className="text-xs text-[#6E6E6E] mt-0.5">Top up Coins to unlock PPVs, tip & subscribe</p>
                </div>
                <div className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                  Balance: {coinsBalance} 🪙
                </div>
              </div>

              {/* Coin Packages */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { coins: 100, price: '$0.99', popular: false },
                  { coins: 500, price: '$4.99', popular: true },
                  { coins: 1200, price: '$9.99', popular: false },
                  { coins: 3000, price: '$24.99', popular: false },
                ].map((pkg) => (
                  <button
                    key={pkg.coins}
                    onClick={() => {
                      topUpCoins(pkg.coins);
                      setWalletModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-102 flex flex-col justify-between relative ${
                      pkg.popular
                        ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                        : 'bg-[#F8F6F2] text-[#111111] border-[#E8E5E0] hover:bg-[#ECE8DF]'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-bold uppercase">
                        Popular
                      </span>
                    )}
                    <span className="font-serif text-2xl font-light">{pkg.coins} 🪙</span>
                    <span className="text-xs font-semibold mt-2">{pkg.price}</span>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-[#8C8C8C] text-center mb-6">
                Discreet billing • 256-bit SSL encrypted • Instant delivery
              </p>

              <button
                onClick={() => setWalletModalOpen(false)}
                className="w-full py-3 bg-[#F2EFE9] text-[#111111] hover:bg-[#EAE5DC] text-xs font-medium rounded-xl"
              >
                Close Wallet
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
