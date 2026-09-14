import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Share2,
  MoreVertical,
  MessageCircle,
  Check,
  Lock,
  Play,
  Coins,
  Sparkles,
  ArrowLeft,
  X,
  Heart
} from "lucide-react";
import { getCreatorProfile, ProfilePost } from "../../data/creatorProfileData";
import { useWalletStore } from "../../store/walletStore";
import { Toast } from "../../components/Toast";
import { ME } from "../../data";
import { MobileBottomNav } from "../../components/MobileChrome";

export function CreatorProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();

  const creator = getCreatorProfile(handle);
  const coinsBalance = useWalletStore((s) => s.coinsBalance);
  const deductCoins = useWalletStore((s) => s.deductCoins);

  const [tab, setTab] = useState<"photos" | "videos" | "vault">("photos");
  const [following, setFollowing] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<ProfilePost | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleToggleFollow = () => {
    const next = !following;
    setFollowing(next);
    notify(next ? `You're now following ${creator.name}` : `Unfollowed ${creator.name}`);
  };

  const handleSubscribe = () => {
    if (!subscribed) {
      if (coinsBalance >= creator.price) {
        deductCoins(creator.price);
        setSubscribed(true);
        notify(`🎉 Subscribed to ${creator.name}! Locked vault archive unlocked.`);
      } else {
        setSubscribed(true);
        notify(`🎉 Welcome to ${creator.name}'s VIP Studio! Vault unlocked.`);
      }
    } else {
      setSubscribed(false);
      notify(`Membership with ${creator.name} cancelled.`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creator.name} on LUXE`,
          text: creator.bio,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(url);
      notify("Profile link copied to clipboard!");
    }
  };

  // Build the list of posts based on the active tab
  const displayedPosts: ProfilePost[] =
    tab === "photos"
      ? creator.photos
      : tab === "videos"
      ? creator.videos
      : creator.vault;

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#121218] flex flex-col selection:bg-[#121218] selection:text-white pb-20 md:pb-12">
      {/* Toast Notification */}
      {toast && <Toast message={toast} />}

      {/* ========================================================================= */}
      {/* TOP DESKTOP HEADER BAR                                                   */}
      {/* ========================================================================= */}
      <header className="hidden md:flex items-center justify-between gap-4 px-6 lg:px-10 py-3.5 bg-white/90 backdrop-blur-md border-b border-[#E7E5DE] sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-[#EDEBE4] hover:bg-[#E2DFD6] transition-colors text-[#121218] cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <nav className="flex items-center gap-2 text-xs font-medium text-[#6F6F7B]">
            <Link to="/app" className="hover:text-[#121218] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/explore" className="hover:text-[#121218] transition-colors">
              Explore
            </Link>
            <span>/</span>
            <span className="text-[#121218] font-bold">{creator.name}</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div
            onClick={() => notify(`Wallet Balance: ${coinsBalance.toLocaleString()} Coins`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E0DCD3] bg-[#FBF1DC] text-[#9A6314] text-xs font-bold shadow-xs cursor-pointer select-none"
          >
            <Coins className="h-3.5 w-3.5" />
            <span>{coinsBalance.toLocaleString()} Coins</span>
          </div>

          <Link to="/app" className="shrink-0">
            <img
              src={ME.avatar}
              alt={ME.name}
              className="h-8 w-8 rounded-full object-cover border border-[#E7E5DE]"
            />
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TOP MOBILE FLOATING GLASS BAR                                            */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between p-3.5 pointer-events-none">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="pointer-events-auto h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#121218] shadow-sm active:scale-95 transition-all cursor-pointer"
          aria-label="Go Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleShare}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#121218] shadow-sm active:scale-95 transition-all cursor-pointer"
            aria-label="Share Creator Profile"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => notify("More profile options")}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#121218] shadow-sm active:scale-95 transition-all cursor-pointer"
            aria-label="More Options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER                                                           */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto md:px-6 lg:px-8 md:py-6">
        <div className="bg-white md:rounded-3xl border-y md:border border-[#E7E5DE] shadow-luxury overflow-hidden">
          
          {/* Cover Photo Banner */}
          <div className="relative h-44 sm:h-56 lg:h-64 w-full bg-[#EDEBE4] overflow-hidden">
            <img
              src={creator.cover}
              alt={`${creator.name} cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
          </div>

          {/* Profile Header & Main Content Layout */}
          <div className="px-4 sm:px-8 pb-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              
              {/* Left Main Column (Avatar, Info, Tabs, Media Grid) */}
              <div className="flex-1 min-w-0">
                
                {/* Avatar & Header Action Buttons */}
                <div className="flex items-end justify-between -mt-12 sm:-mt-16 mb-4">
                  <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white bg-[#EDEBE4] object-cover shadow-luxury"
                    />
                    {creator.verified && (
                      <span className="absolute bottom-1 right-1 grid place-items-center h-6 w-6 rounded-full bg-blue-600 text-white shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 pb-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/messages?handle=${creator.handle}`)}
                      className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#E7E5DE] bg-white text-xs sm:text-sm font-bold text-[#121218] hover:bg-[#F6F5F1] active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4 text-[#6F6F7B]" />
                      <span>Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-xs cursor-pointer ${
                        following
                          ? "bg-[#F6F5F1] text-[#121218] border border-[#E7E5DE] hover:bg-[#EDEBE4]"
                          : "bg-[#121218] text-white hover:bg-black"
                      }`}
                    >
                      {following ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>

                {/* Creator Name, Handle & Category */}
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#121218] tracking-tight">
                      {creator.name}
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6F6F7B] mt-0.5">
                    @{creator.handle} · <span className="font-semibold text-[#121218]">{creator.category}</span>
                  </p>
                </div>

                {/* Bio Description */}
                <p className="text-xs sm:text-sm text-[#3B3B46] leading-relaxed max-w-xl mb-4 font-normal">
                  {creator.bio}
                </p>

                {/* Stats Bar */}
                <div className="flex items-center gap-5 sm:gap-6 py-3 border-y border-[#F0ECE4] text-xs sm:text-sm text-[#6F6F7B] mb-6">
                  <span>
                    <strong className="font-extrabold text-[#121218]">
                      {(creator.fans / 1000).toFixed(1)}k
                    </strong>{" "}
                    fans
                  </span>
                  <span>
                    <strong className="font-extrabold text-[#121218]">
                      {creator.photos.length + creator.videos.length}
                    </strong>{" "}
                    posts
                  </span>
                  <span>
                    <strong className="font-extrabold text-[#121218]">
                      {creator.since}
                    </strong>{" "}
                    member
                  </span>
                </div>

                {/* Mobile In-feed Membership Card */}
                <div className="lg:hidden mb-6">
                  <div className="relative overflow-hidden rounded-2xl bg-[#121218] p-5 text-white shadow-luxury">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                        {creator.tier}
                      </span>
                      <span className="text-lg font-extrabold text-amber-300">
                        {creator.price} Coins/mo
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {creator.perks.map((perk, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-white/85">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleSubscribe}
                      className={`w-full py-3 rounded-full text-xs font-bold transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 ${
                        subscribed
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-white text-[#121218] hover:bg-white/90 shadow-md"
                      }`}
                    >
                      {subscribed ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Subscribed ✓</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>Subscribe for {creator.price} Coins</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F6F5F1] rounded-full border border-[#E7E5DE] w-fit mb-6 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setTab("photos")}
                    className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      tab === "photos"
                        ? "bg-[#121218] text-white shadow-xs"
                        : "text-[#6F6F7B] hover:text-[#121218]"
                    }`}
                  >
                    Photos ({creator.photos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("videos")}
                    className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      tab === "videos"
                        ? "bg-[#121218] text-white shadow-xs"
                        : "text-[#6F6F7B] hover:text-[#121218]"
                    }`}
                  >
                    Videos ({creator.videos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("vault")}
                    className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      tab === "vault"
                        ? "bg-[#121218] text-white shadow-xs"
                        : "text-[#6F6F7B] hover:text-[#121218]"
                    }`}
                  >
                    <Lock className="h-3 w-3" />
                    <span>Locked Vault ({creator.vault.length})</span>
                  </button>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {displayedPosts.map((post) => {
                    const isLocked = tab === "vault" && !subscribed;

                    return (
                      <div
                        key={post.id}
                        onClick={() => {
                          if (isLocked) {
                            notify("Subscribe to unlock full-resolution vault post!");
                          } else {
                            setSelectedMedia(post);
                          }
                        }}
                        className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#EDEBE4] border border-[#E7E5DE] cursor-pointer shadow-xs"
                      >
                        <img
                          src={post.thumb}
                          alt={post.caption || creator.name}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            isLocked ? "blur-md scale-110" : ""
                          }`}
                        />

                        {/* Video Duration Badge */}
                        {post.isVideo && !isLocked && (
                          <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                            <Play className="h-2.5 w-2.5 fill-current" />
                            <span>{post.duration}</span>
                          </span>
                        )}

                        {/* Locked Vault Overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-2 text-center text-white">
                            <div className="grid place-items-center h-8 w-8 rounded-full bg-white/20 backdrop-blur-md">
                              <Lock className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                              Subscriber Only
                            </span>
                          </div>
                        )}

                        {/* Unlocked Hover Overlay */}
                        {!isLocked && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end p-2.5 opacity-0 group-hover:opacity-100">
                            {post.caption && (
                              <p className="text-white text-[11px] font-medium line-clamp-1">
                                {post.caption}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Right Sidebar Column (Sticky Membership Card for Desktop) */}
              <div className="hidden lg:block w-72 shrink-0 pt-6">
                <div className="sticky top-20 rounded-3xl bg-[#121218] p-6 text-white shadow-2xl relative overflow-hidden border border-[#2A2A35]">
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5 pointer-events-none" />

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                      {creator.tier}
                    </span>
                    <span className="text-xl font-extrabold text-amber-300">
                      {creator.price} Coins/mo
                    </span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed mb-5">
                    Unlock full archive access, weekly drops, and direct creator updates.
                  </p>

                  <div className="space-y-2.5 mb-6">
                    {creator.perks.map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-white/90">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[2.5] mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSubscribe}
                    className={`w-full py-3.5 rounded-full text-xs font-bold transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                      subscribed
                        ? "bg-white/15 text-white border border-white/20 hover:bg-white/25"
                        : "bg-white text-[#121218] hover:bg-white/90 shadow-lg"
                    }`}
                  >
                    {subscribed ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Subscribed ✓</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span>Subscribe for {creator.price} Coins/mo</span>
                      </>
                    )}
                  </button>

                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <span className="text-[11px] text-white/50">
                      Cancel anytime · Instant vault access
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* FULLSCREEN MEDIA LIGHTBOX MODAL                                          */}
      {/* ========================================================================= */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="w-full max-h-[75vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl border border-white/10">
              <img
                src={selectedMedia.fullImage}
                alt={selectedMedia.caption || creator.name}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            {selectedMedia.caption && (
              <div className="mt-4 text-center max-w-lg">
                <p className="text-white text-sm font-medium">{selectedMedia.caption}</p>
                <p className="text-white/60 text-xs mt-1">By {creator.name} (@{creator.handle})</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Navigation */}
      <MobileBottomNav onNotify={notify} />
    </div>
  );
}
