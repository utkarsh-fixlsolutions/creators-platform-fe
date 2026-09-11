import { useCallback, useRef, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  Bookmark,
  EyeOff,
  Flag,
  Heart,
  Layers,
  Link2,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Comment, Creator, Post } from "../data";
import { ME } from "../data";
import { cn } from "../utils/cn";
import { formatCount } from "../utils/format";
import { useClickOutside } from "../hooks/useClickOutside";
import { Avatar } from "./Avatar";
import { Menu } from "./Menu";

interface PostCardProps {
  post: Post;
  creator: Creator;
  onLike: (postId: string) => void;
  onFollow: (creatorId: string) => void;
  onShare: (post: Post) => void;
  onUnlock: (postId: string) => void;
  onTagClick: (tag: string) => void;
  onNotify: (message: string) => void;
}

export function PostCard({
  post,
  creator,
  onLike,
  onFollow,
  onShare,
  onUnlock,
  onTagClick,
  onNotify,
}: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(false);
  const [bigHeart, setBigHeart] = useState(0);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [draft, setDraft] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useClickOutside(menuRef, closeMenu, menuOpen);

  const locked = Boolean(post.exclusive && !post.unlocked);
  const commentTotal = post.commentCount + (comments.length - post.comments.length);

  const like = () => {
    if (!post.liked) {
      setBurst(true);
      window.setTimeout(() => setBurst(false), 650);
    }
    onLike(post.id);
  };

  const handleDoubleTap = () => {
    if (locked) return;
    setBigHeart((n) => n + 1);
    if (!post.liked) like();
  };

  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, author: ME.name, avatar: ME.avatar, text, timeAgo: "now" },
    ]);
    setDraft("");
  };

  const toggleSave = () => {
    setSaved((s) => !s);
    onNotify(saved ? "Removed from saved" : "Saved to your collection");
  };

  return (
    <article
      aria-labelledby={`post-${post.id}-creator`}
      className="group/card overflow-hidden rounded-[28px] border border-line bg-surface shadow-card transition-[box-shadow,transform] duration-500 ease-out hover:shadow-card-hover"
    >
      {/* ---- Creator header ------------------------------------------------ */}
      <header className="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-5">
        <Avatar
          src={creator.avatar}
          alt={creator.name}
          size={44}
          ring={post.live ? "live" : creator.membership ? "gold" : undefined}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2
              id={`post-${post.id}-creator`}
              className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink"
            >
              {creator.name}
            </h2>
            {creator.verified && (
              <BadgeCheck
                className="h-[17px] w-[17px] shrink-0 fill-brand text-white"
                aria-label="Verified"
              />
            )}
            {post.exclusive && (
              <span className="ml-1 hidden items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold-deep sm:inline-flex">
                <Sparkles className="h-3 w-3" />
                {post.unlocked ? "Members" : "Exclusive"}
              </span>
            )}
          </div>
          <p className="truncate text-[13px] text-muted">
            @{creator.handle}
            <span className="mx-1.5 text-faint">·</span>
            {creator.category}
            <span className="mx-1.5 text-faint">·</span>
            <time className={cn(post.live && "font-semibold text-live")}>{post.timeAgo}</time>
          </p>
        </div>
        <FollowButton following={creator.following} onClick={() => onFollow(creator.id)} />
      </header>

      {/* ---- Media --------------------------------------------------------- */}
      <figure
        className="relative mx-3 overflow-hidden rounded-[20px] bg-paper-deep sm:mx-4"
        onDoubleClick={handleDoubleTap}
      >
        <div className="aspect-[4/3] select-none">
          <img
            src={post.image}
            alt={post.alt}
            loading="lazy"
            decoding="async"
            className={cn(
              "h-full w-full object-cover transition-transform duration-[900ms] ease-out",
              locked ? "scale-110 blur-2xl saturate-[0.85]" : "group-hover/card:scale-[1.025]",
            )}
          />
        </div>

        {/* Soft vignette so badges stay legible */}
        {!locked && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-ink/5 opacity-60"
          />
        )}

        {/* Badges */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {post.live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-live px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-md">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
              Live · {formatCount(post.live.viewers)} watching
            </span>
          ) : post.collection ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <Layers className="h-3 w-3" />
              {post.collection}
            </span>
          ) : (
            <span />
          )}
          {post.location && !locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <MapPin className="h-3 w-3" />
              {post.location}
            </span>
          )}
        </div>

        {post.video && !locked && (
          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <Play className="h-3 w-3 fill-white" />
            {post.video.duration}
          </span>
        )}

        {/* Big heart on double‑tap */}
        {bigHeart > 0 && (
          <Heart
            key={bigHeart}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto h-24 w-24 animate-heart-big fill-white text-white drop-shadow-[0_8px_24px_rgba(18,18,24,0.35)]"
          />
        )}

        {/* Members‑only overlay */}
        {locked && (
          <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/40 p-6 text-center text-white">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-md">
              <Lock className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <p className="font-display text-[28px] leading-none sm:text-[32px]">Members only</p>
            <p className="max-w-[26ch] text-[13px] leading-relaxed text-white/80 sm:text-sm">
              Join {creator.name.split(" ")[0]}'s studio to unlock this post and the full archive.
            </p>
            <button
              type="button"
              onClick={() => onUnlock(post.id)}
              className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-paper hover:shadow-xl active:translate-y-0"
            >
              <Sparkles className="h-4 w-4 text-gold" />
              Unlock for ${creator.membership}/mo
            </button>
          </figcaption>
        )}
      </figure>

      {/* ---- Actions: like · comment · share · … --------------------------- */}
      <div className="flex items-center gap-0.5 px-3 pt-2.5 sm:px-4">
        <ActionButton
          icon={Heart}
          label={formatCount(post.likes)}
          ariaLabel={post.liked ? "Unlike" : "Like"}
          pressed={post.liked}
          activeClass="text-rose"
          hoverClass="hover:text-rose"
          fillWhenActive
          burst={burst}
          onClick={like}
        />
        <ActionButton
          icon={MessageCircle}
          label={formatCount(commentTotal)}
          ariaLabel="Comments"
          pressed={commentsOpen}
          activeClass="text-brand bg-brand-soft"
          hoverClass="hover:text-brand"
          onClick={() => setCommentsOpen((o) => !o)}
        />
        <ActionButton
          icon={Send}
          label="Share"
          ariaLabel="Share"
          hoverClass="hover:text-brand"
          onClick={() => onShare(post)}
        />

        <div ref={menuRef} className="relative ml-auto">
          <button
            type="button"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition-colors duration-200",
              menuOpen ? "bg-paper text-ink" : "text-muted hover:bg-paper hover:text-ink",
            )}
          >
            <MoreHorizontal className="h-[22px] w-[22px]" />
          </button>
          {menuOpen && (
            <Menu
              label="Post options"
              items={[
                {
                  icon: Bookmark,
                  label: saved ? "Remove from saved" : "Save post",
                  hint: "Keep it in your collection",
                  onSelect: () => {
                    toggleSave();
                    setMenuOpen(false);
                  },
                },
                {
                  icon: Link2,
                  label: "Copy link",
                  onSelect: () => {
                    onShare(post);
                    setMenuOpen(false);
                  },
                },
                {
                  icon: EyeOff,
                  label: "Not interested",
                  hint: "See fewer posts like this",
                  onSelect: () => {
                    onNotify("Thanks — we'll tune your feed");
                    setMenuOpen(false);
                  },
                },
                {
                  icon: Flag,
                  label: "Report",
                  danger: true,
                  onSelect: () => {
                    onNotify("Report submitted");
                    setMenuOpen(false);
                  },
                },
              ]}
            />
          )}
        </div>
      </div>

      {/* ---- Caption -------------------------------------------------------- */}
      <div className="px-4 pb-4 pt-1.5 sm:px-5 sm:pb-5">
        <p className="text-[15px] leading-[1.55] text-ink">
          <span className="font-semibold">{creator.name}</span>{" "}
          <span className="text-ink-soft">{post.caption}</span>{" "}
          {post.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="mr-1.5 font-medium text-brand transition-colors hover:text-brand-deep hover:underline underline-offset-2"
            >
              #{tag}
            </button>
          ))}
        </p>

        {!commentsOpen && (
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="mt-1.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            View all {formatCount(commentTotal)} comments
          </button>
        )}

        {commentsOpen && (
          <div className="mt-4 animate-fade-up space-y-3.5 border-t border-line pt-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <Avatar src={comment.avatar} alt={comment.author} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-snug">
                    <span className="font-semibold">{comment.author}</span>{" "}
                    <span className="text-ink-soft">{comment.text}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {comment.timeAgo}
                    <button type="button" className="ml-3 font-medium hover:text-ink">
                      Reply
                    </button>
                  </p>
                </div>
              </div>
            ))}

            <form onSubmit={submitComment} className="flex items-center gap-2.5 pt-1">
              <Avatar src={ME.avatar} alt={ME.name} size={30} />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Reply to ${creator.name.split(" ")[0]}…`}
                aria-label="Write a comment"
                className="h-10 min-w-0 flex-1 rounded-full border border-line bg-paper px-4 text-sm outline-none transition-all duration-200 placeholder:text-faint focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/10"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="h-10 rounded-full bg-ink px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-ink"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------------- */

function FollowButton({ following, onClick }: { following: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={following}
      className={cn(
        "h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-all duration-200",
        following
          ? "border border-line bg-surface text-ink-soft hover:border-rose/40 hover:bg-rose-soft hover:text-rose"
          : "bg-ink text-white shadow-ink hover:-translate-y-px hover:bg-brand hover:shadow-brand active:translate-y-0",
      )}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  ariaLabel: string;
  onClick: () => void;
  pressed?: boolean;
  activeClass?: string;
  hoverClass?: string;
  fillWhenActive?: boolean;
  burst?: boolean;
}

function ActionButton({
  icon: Icon,
  label,
  ariaLabel,
  onClick,
  pressed = false,
  activeClass,
  hoverClass,
  fillWhenActive,
  burst,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={cn(
        "group/action relative flex h-10 items-center gap-2 rounded-full px-3 text-[14px] font-medium tracking-[-0.01em] transition-colors duration-200",
        pressed ? activeClass : cn("text-ink-soft hover:bg-paper", hoverClass),
      )}
    >
      <span className="relative grid place-items-center">
        <Icon
          className={cn(
            "h-[22px] w-[22px] transition-transform duration-200 group-active/action:scale-90",
            pressed && "animate-pop",
          )}
          strokeWidth={2}
          fill={pressed && fillWhenActive ? "currentColor" : "none"}
        />
        {burst && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-burst rounded-full border-2 border-rose"
          />
        )}
      </span>
      <span className="tabular-nums">{label}</span>
    </button>
  );
}
