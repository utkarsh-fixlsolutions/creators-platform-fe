import { Home, Images, MessageCircle, Menu as MenuIcon, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StudioMobileNavProps {
  activeId: string;
  onNavigate: (id: string) => void;
  onCreateClick: () => void;
  messagesBadge?: number;
}

const ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'content', label: 'Content', icon: Images },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'settings', label: 'More', icon: MenuIcon },
];

/** Floating capsule bottom nav for Creator Studio — mirrors the fan app's
 *  MobileBottomNav pill treatment, with an elevated center "+" create action. */
export function StudioMobileNav({ activeId, onNavigate, onCreateClick, messagesBadge }: StudioMobileNavProps) {
  const [left, right] = [ITEMS.slice(0, 2), ITEMS.slice(2)];

  const renderItem = (item: (typeof ITEMS)[number]) => {
    const isActive = activeId === item.id;
    const Icon = item.icon;
    const badge = item.id === 'messages' ? messagesBadge : undefined;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onNavigate(item.id)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
        className={cn(
          'group relative flex h-11 items-center justify-center transition-all duration-300 ease-out select-none cursor-pointer',
          isActive ? 'w-11 rounded-full bg-ink text-white shadow-ink' : 'w-11 rounded-full text-muted hover:bg-paper/80 hover:text-ink active:scale-95'
        )}
      >
        <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.3 : 1.9} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9.5px] font-bold text-white ring-2 ring-surface">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav
      aria-label="Creator Studio"
      className="md:hidden fixed bottom-4 inset-x-0 z-40 mx-auto flex w-fit items-center gap-2 rounded-full border border-line/80 bg-surface/90 px-2 py-1.5 shadow-[0_16px_40px_-10px_rgba(18,18,24,0.25)] ring-1 ring-white/80 backdrop-blur-2xl"
    >
      <div className="flex items-center gap-1.5">{left.map(renderItem)}</div>

      {/* Elevated center Create button */}
      <button
        type="button"
        onClick={onCreateClick}
        aria-label="Create"
        className="relative -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-white shadow-ink ring-4 ring-paper transition-all duration-200 hover:bg-brand hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Plus className="h-6 w-6" strokeWidth={2.4} />
      </button>

      <div className="flex items-center gap-1.5">{right.map(renderItem)}</div>
    </nav>
  );
}
