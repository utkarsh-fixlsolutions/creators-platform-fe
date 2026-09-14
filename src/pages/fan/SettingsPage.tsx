import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Coins,
  CreditCard,
  Lock,
  Radio,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Sidebar, type NavItem } from "../../components/Sidebar";
import { MobileBottomNav, MobileTopBar } from "../../components/MobileChrome";
import { RightRail } from "../../components/RightRail";
import { Toast } from "../../components/Toast";
import { Reveal } from "../../components/Reveal";
import { useSessionStore } from "../../store/sessionStore";
import { useWalletStore } from "../../store/walletStore";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import { useSidebarStore } from "../../store/sidebarStore";
import { CREATORS, SUGGESTED_IDS } from "../../data";
import { cn } from "../../utils/cn";

export function SettingsPage() {
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarStore((s) => s.isCollapsed);
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);
  const coinsBalance = useWalletStore((s) => s.coinsBalance);
  const { activeCount, totalMonthlySpend } = useSubscriptionStore();

  const numActive = activeCount();
  const monthlySpend = totalMonthlySpend();

  // Profile Form state
  const [fullName, setFullName] = useState(user?.displayName || "Maya Chen");
  const [handle, setHandle] = useState(user?.handle || "maya.makes");
  const [email, setEmail] = useState(user?.email || "maya.chen@example.com");

  // Security state
  const [twoFactor, setTwoFactor] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Notification state
  const [notifyPosts, setNotifyPosts] = useState(true);
  const [notifyDMs, setNotifyDMs] = useState(true);
  const [notifyLive, setNotifyLive] = useState(false);
  const [notifyTips, setNotifyTips] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(false);

  // Privacy state
  const [messagePrivacy, setMessagePrivacy] = useState<"everyone" | "subscribers">("everyone");
  const [activityStatus, setActivityStatus] = useState(true);

  // Deactivate modal state
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const creatorById = CREATORS.reduce<Record<string, (typeof CREATORS)[number]>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  const suggested = SUGGESTED_IDS.map((id) => creatorById[id]).filter(Boolean);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      notify("Please enter a valid name");
      return;
    }
    if (user) {
      setUser({
        ...user,
        displayName: fullName.trim(),
        handle: handle.trim().replace(/^@/, ""),
        email: email.trim(),
      });
    }
    notify("Profile changes saved successfully");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      notify("Please fill in both password fields");
      return;
    }
    if (newPassword.length < 6) {
      notify("New password must be at least 6 characters");
      return;
    }
    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    notify("Password updated successfully");
  };

  const handleSidebarNavigate = (item: NavItem) => {
    if (item.id === "home") {
      navigate("/app");
    } else if (item.id === "messages") {
      navigate("/messages");
    } else if (item.id === "notifications") {
      navigate("/notifications");
    } else if (item.id === "live") {
      navigate("/live");
    } else if (item.id === "subscriptions") {
      navigate("/subscriptions");
    } else if (item.id === "explore" || item.id === "creators") {
      navigate("/explore");
    } else if (item.id === "settings") {
      // already on settings
    } else {
      notify(`${item.label} is coming soon`);
    }
  };

  const handleMobileNav = (item: NavItem) => {
    if (item.id === "home") {
      navigate("/app");
    } else if (item.id === "messages") {
      navigate("/messages");
    } else if (item.id === "subscriptions") {
      navigate("/subscriptions");
    } else if (item.id === "explore") {
      navigate("/explore");
    } else if (item.id === "profile") {
      // already on settings
    }
  };

  return (
    <div className="page-glow min-h-screen bg-paper text-ink">
      {/* Mobile Top Bar */}
      <MobileTopBar
        onNotify={notify}
        onLiveClick={() => navigate("/live")}
        isLiveActive={false}
        onNotificationsClick={() => navigate("/notifications")}
      />

      {/* 3-Column Responsive Layout */}
      <div
        className={cn(
          "w-full grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] transition-all duration-300 ease-in-out",
          isSidebarCollapsed
            ? "lg:grid-cols-[80px_minmax(0,1fr)] xl:grid-cols-[80px_minmax(0,1fr)_356px] 2xl:grid-cols-[80px_minmax(0,1fr)_380px]"
            : "lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_356px] 2xl:grid-cols-[272px_minmax(0,1fr)_380px]",
        )}
      >
        {/* Left Sidebar */}
        <Sidebar
          activeTab="settings"
          onNavigate={handleSidebarNavigate}
          onCreate={() => notify("The composer opens in the full app")}
          onLogoClick={() => navigate("/")}
        />

        {/* Center Main Settings Column */}
        <main className="min-w-0 px-3.5 pb-28 sm:px-6 md:pb-14 lg:px-8">
          <div className="mx-auto w-full max-w-[680px]">
            {/* Header */}
            <div className="flex items-center justify-between pt-5 sm:pt-6 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  aria-label="Back"
                  className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-soft hover:bg-paper md:hidden transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="font-bold text-[22px] sm:text-[24px] tracking-tight text-ink">
                  Settings
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              {/* 1. Profile Section */}
              <Reveal>
                <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-card transition-all">
                  <h2 className="text-[15px] font-bold text-ink mb-4">Profile</h2>

                  {/* Avatar & Photo Action */}
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand font-bold text-[22px] ring-2 ring-line/50 shrink-0">
                      {fullName.charAt(0).toUpperCase() || "M"}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => notify("Photo upload dialog opened")}
                        className="h-9 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink-soft hover:border-line-strong hover:bg-paper hover:text-ink active:scale-95 transition-all cursor-pointer"
                      >
                        Change photo
                      </button>
                      <p className="text-[11.5px] text-muted mt-1">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <form onSubmit={handleSaveProfile} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <label className="flex flex-col gap-1.5 text-left">
                        <span className="text-[12px] font-semibold text-muted">Full name</span>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-[42px] rounded-xl border border-line bg-paper px-3.5 text-[14px] text-ink transition-all focus:border-brand/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20"
                          placeholder="Your full name"
                        />
                      </label>

                      <label className="flex flex-col gap-1.5 text-left">
                        <span className="text-[12px] font-semibold text-muted">Handle</span>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-[14px] text-muted select-none">@</span>
                          <input
                            type="text"
                            value={handle.replace(/^@/, "")}
                            onChange={(e) => setHandle(e.target.value)}
                            className="h-[42px] w-full rounded-xl border border-line bg-paper pl-8 pr-3.5 text-[14px] text-ink transition-all focus:border-brand/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20"
                            placeholder="handle"
                          />
                        </div>
                      </label>

                      <label className="flex flex-col gap-1.5 text-left sm:col-span-2">
                        <span className="text-[12px] font-semibold text-muted">Email address</span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-[42px] rounded-xl border border-line bg-paper px-3.5 text-[14px] text-ink transition-all focus:border-brand/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20"
                          placeholder="your.email@example.com"
                        />
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="rounded-full bg-brand px-6 py-2.5 text-[13.5px] font-bold text-white shadow-xs hover:bg-brand-deep hover:shadow-brand active:scale-95 transition-all cursor-pointer"
                      >
                        Save changes
                      </button>
                    </div>
                  </form>
                </section>
              </Reveal>

              {/* 2. Password & Security Section */}
              <Reveal delay={40}>
                <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-card">
                  <h2 className="text-[15px] font-bold text-ink">Password &amp; security</h2>
                  <p className="text-[12.5px] text-muted mt-0.5 mb-3">Last changed 3 months ago</p>

                  <div className="divide-y divide-line">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <span className="text-[14px] font-medium text-ink">Change password</span>
                        <p className="text-[12px] text-muted">Set a strong unique password</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPasswordModalOpen(true)}
                        className="h-[34px] rounded-full border border-line bg-surface px-3.5 text-[12.5px] font-semibold text-ink-soft hover:border-line-strong hover:bg-paper hover:text-ink active:scale-95 transition-all cursor-pointer"
                      >
                        Update
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[14px] font-medium text-ink">Two-factor authentication</p>
                        <p className="text-[12px] text-muted">Add an extra layer of security on login</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={twoFactor}
                        onClick={() => {
                          const next = !twoFactor;
                          setTwoFactor(next);
                          notify(next ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
                        }}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          twoFactor ? "bg-brand" : "bg-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                            twoFactor ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </section>
              </Reveal>

              {/* 3. Notification Preferences */}
              <Reveal delay={80}>
                <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-card">
                  <h2 className="text-[15px] font-bold text-ink mb-2">Notifications</h2>

                  <div className="divide-y divide-line">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[14px] text-ink">New posts from creators I follow</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notifyPosts}
                        onClick={() => setNotifyPosts(!notifyPosts)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                          notifyPosts ? "bg-brand" : "bg-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200",
                            notifyPosts ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-[14px] text-ink">Direct messages</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notifyDMs}
                        onClick={() => setNotifyDMs(!notifyDMs)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                          notifyDMs ? "bg-brand" : "bg-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200",
                            notifyDMs ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-[14px] text-ink">Live alerts from creators I follow</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notifyLive}
                        onClick={() => setNotifyLive(!notifyLive)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                          notifyLive ? "bg-brand" : "bg-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200",
                            notifyLive ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-[14px] text-ink">Tips &amp; billing receipts</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notifyTips}
                        onClick={() => setNotifyTips(!notifyTips)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                          notifyTips ? "bg-brand" : "bg-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200",
                            notifyTips ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-[14px] text-ink">Product updates &amp; announcements</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={notifyUpdates}
                        onClick={() => setNotifyUpdates(!notifyUpdates)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                          notifyUpdates ? "bg-brand" : "bg-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200",
                            notifyUpdates ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </section>
              </Reveal>

              {/* 4. Privacy Section */}
              <Reveal delay={120}>
                <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-card">
                  <h2 className="text-[15px] font-bold text-ink mb-2">Privacy</h2>

                  <div className="divide-y divide-line">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3">
                      <span className="text-[14px] text-ink">Who can message me</span>
                      <div className="inline-flex gap-1 rounded-full border border-line bg-paper p-1">
                        <button
                          type="button"
                          onClick={() => setMessagePrivacy("everyone")}
                          className={cn(
                            "rounded-full px-3.5 py-1 text-[12px] font-semibold transition-all cursor-pointer",
                            messagePrivacy === "everyone"
                              ? "bg-ink text-white shadow-xs"
                              : "text-muted hover:text-ink"
                          )}
                        >
                          Everyone
                        </button>
                        <button
                          type="button"
                          onClick={() => setMessagePrivacy("subscribers")}
                          className={cn(
                            "rounded-full px-3.5 py-1 text-[12px] font-semibold transition-all cursor-pointer",
                            messagePrivacy === "subscribers"
                              ? "bg-ink text-white shadow-xs"
                              : "text-muted hover:text-ink"
                          )}
                        >
                          Subscribers only
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[14px] text-ink">Show my activity status</p>
                        <p className="text-[12px] text-muted">Lets creators see when you're online</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={activityStatus}
                        onClick={() => {
                          const next = !activityStatus;
                          setActivityStatus(next);
                          notify(next ? "Activity status visible" : "Activity status hidden");
                        }}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                          activityStatus ? "bg-brand" : "bg-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200",
                            activityStatus ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-[14px] text-ink">Blocked creators</span>
                      <button
                        type="button"
                        onClick={() => notify("No blocked creators in your list")}
                        className="text-[13px] font-semibold text-brand hover:text-brand-deep hover:underline cursor-pointer"
                      >
                        Manage list
                      </button>
                    </div>
                  </div>
                </section>
              </Reveal>

              {/* 5. Subscription & Billing Section */}
              <Reveal delay={160}>
                <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-card">
                  <h2 className="text-[15px] font-bold text-ink mb-3.5">Subscription &amp; billing</h2>

                  {/* Gold Active Memberships Pill Banner */}
                  <div className="flex items-center justify-between rounded-2xl border border-[#e9d6ab] bg-gold-soft p-3.5 px-4 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <Coins className="h-4 w-4 stroke-[2.2] text-gold-deep" />
                      <span className="text-[13px] font-bold text-gold-deep">
                        {numActive} active memberships · {monthlySpend} Coins/mo
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/subscriptions")}
                      className="text-[13px] font-bold text-gold-deep hover:underline cursor-pointer"
                    >
                      Manage &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-line mt-3">
                    <div className="flex items-center justify-between py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-9 items-center justify-center rounded bg-ink text-[9px] font-extrabold tracking-wider text-white">
                          VISA
                        </span>
                        <span className="text-[14px] text-ink font-medium">Visa ···· 4242</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => notify("Payment method management")}
                        className="text-[13px] font-semibold text-brand hover:text-brand-deep hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3.5">
                      <span className="text-[14px] text-ink font-medium">Wallet balance</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-ink tabular-nums">
                          💎 {coinsBalance} Coins
                        </span>
                        <button
                          type="button"
                          onClick={() => notify("Top up wallet coming soon")}
                          className="text-[12.5px] font-semibold text-brand hover:underline"
                        >
                          Top up
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </Reveal>

              {/* 6. Danger Zone */}
              <div className="pt-4 pb-6 flex items-center justify-between border-t border-line">
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">Deactivate or delete account</p>
                  <p className="text-[12px] text-muted">This can't be undone once confirmed</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeactivateModalOpen(true)}
                  className="text-[13px] font-bold text-rose hover:underline cursor-pointer"
                >
                  Deactivate account
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Rail */}
        <RightRail
          suggested={suggested}
          onFollow={(id) => notify(`Creator followed`)}
          onTagClick={(tag) => {
            navigate("/explore");
          }}
          onNotify={notify}
        />
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-[420px] rounded-[24px] border border-line bg-surface p-6 shadow-pop text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[18px] text-ink">Update Password</h3>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-muted">Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 rounded-xl border border-line bg-paper px-3.5 text-sm text-ink focus:border-brand/60 focus:bg-surface focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-muted">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 rounded-xl border border-line bg-paper px-3.5 text-sm text-ink focus:border-brand/60 focus:bg-surface focus:outline-none"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-deep shadow-xs"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {deactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-[420px] rounded-[24px] border border-line bg-surface p-6 shadow-pop text-left">
            <h3 className="font-bold text-[18px] text-ink mb-2">Deactivate Account?</h3>
            <p className="text-[13px] text-muted leading-relaxed mb-5">
              Are you sure you want to deactivate your account? All active subscriptions will be cancelled, and your profile will no longer be visible.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeactivateModalOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-paper"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeactivateModalOpen(false);
                  notify("Account deactivation requested");
                }}
                className="rounded-full bg-rose px-5 py-2 text-sm font-bold text-white hover:bg-rose/90 shadow-xs"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Capsule Navigation */}
      <MobileBottomNav activeTab="profile" onNavigate={handleMobileNav} />

      {/* Toast Notification */}
      <Toast message={toast} />
    </div>
  );
}
