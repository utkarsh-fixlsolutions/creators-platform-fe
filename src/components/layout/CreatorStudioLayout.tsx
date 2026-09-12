import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  DollarSign,
  PlusCircle,
  Megaphone,
  Radio,
  Settings,
  ArrowUpRight,
  LogOut
} from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useWalletStore } from '../../store/walletStore';
import { VerifiedBadge } from '../ui/VerifiedBadge';

export const CreatorStudioLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, switchActiveRole } = useSessionStore();
  const { availableCredits, pendingCredits } = useWalletStore();

  const handleSwitchToFan = () => {
    switchActiveRole('fan');
    navigate('/app');
  };

  const menuItems = [
    { label: 'Overview', path: '/studio', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Earnings & Payouts', path: '/studio/earnings', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Publish Content', path: '/studio/create', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Mass Broadcasts', path: '/studio/broadcast', icon: <Megaphone className="w-4 h-4" /> },
    { label: 'Live Broadcast', path: '/studio/live', icon: <Radio className="w-4 h-4" /> },
    { label: 'Studio Settings', path: '/studio/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EB] text-[#111111] flex flex-col md:flex-row">
      
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-[#E8E5E0] flex flex-col justify-between p-5 md:p-6 shrink-0 md:min-h-screen sticky md:top-0 z-30">
        
        <div>
          {/* Studio Brand Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#EFECE6]">
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-2xl font-light tracking-[0.25em] text-[#111111] uppercase">
                LUXE
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#111111] text-white text-[10px] font-mono uppercase tracking-wider font-semibold">
                Studio
              </span>
            </div>
            
            <button
              onClick={() => navigate('/app')}
              className="p-1.5 rounded-lg text-[#6E6E6E] hover:text-[#111111] hover:bg-[#F5F2EB] md:hidden"
              title="Close Sidebar"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Creator Mini Profile Card */}
          <div className="flex items-center gap-3 p-3 bg-[#F8F6F2] rounded-2xl border border-[#EBE6DC] mb-6">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'}
              alt={user?.displayName || 'Creator'}
              className="w-10 h-10 rounded-full object-cover border border-[#E0DCD3]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-[#111111] truncate">{user?.displayName}</span>
                <VerifiedBadge size={14} />
              </div>
              <p className="text-[11px] text-[#7A7772] truncate">@{user?.handle}</p>
            </div>
          </div>

          {/* Studio Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#6E6E6E] hover:text-[#111111] hover:bg-[#F5F2EB]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Role Switcher & Log Out */}
        <div className="pt-6 mt-6 border-t border-[#EFECE6] space-y-2">
          
          {/* Quick Balance Preview */}
          <div className="p-3 rounded-xl bg-[#EDE8DE]/70 text-[11px] space-y-1 mb-2">
            <div className="flex justify-between text-[#7A7772]">
              <span>Available</span>
              <strong className="text-[#111111] font-mono">${(availableCredits / 100).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-[#8C8C8C] text-[10px]">
              <span>Pending (7d hold)</span>
              <span className="font-mono">${(pendingCredits / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Switch to Fan Mode Button */}
          <button
            onClick={handleSwitchToFan}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-medium bg-[#F5F2EB] hover:bg-[#ECE7DE] text-[#111111] flex items-center justify-between transition-colors"
          >
            <span>Switch to Fan App</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full py-2 px-3 text-xs text-left text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>

        </div>

      </aside>

      {/* Main Studio Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Studio Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E8E5E0]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight">
              Creator Studio
            </h1>
            <p className="text-xs text-[#7A7772] mt-0.5">
              Live earnings, audience retention & publishing hub
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/studio/create')}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-medium rounded-xl flex items-center gap-1.5 hover:bg-[#2A2A2A] transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Post</span>
            </button>
            <button
              onClick={() => navigate('/studio/live')}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 hover:bg-rose-700 transition-all shadow-xs"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Go Live</span>
            </button>
          </div>
        </div>

        {/* Dynamic Studio Route Content */}
        <Outlet />

      </main>

    </div>
  );
};
