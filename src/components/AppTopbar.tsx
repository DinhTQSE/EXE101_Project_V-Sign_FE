import { Bell, Flame, Globe, Menu, Moon, Search, Star, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";

interface AppTopbarProps {
  onMenuClick: () => void;
}

export default function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const { stats, isPremium } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="relative z-30 mx-3 mt-3 flex h-16 shrink-0 items-center gap-2 app-topbar px-3 sm:gap-3 md:sticky md:top-4 md:mx-6 md:mt-4 md:h-[72px] md:px-5">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-[14px] hover:bg-muted transition-colors shrink-0"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl hidden sm:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm bài học, từ vựng..."
          className="app-search w-full pl-10 pr-4 py-3 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:bg-card transition-all"
        />
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2.5">
        {/* Language indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-muted/75 border border-border/70 text-muted-foreground text-xs font-body font-bold shadow-sm">
          <Globe className="w-3.5 h-3.5" />
          Tiếng Việt
        </div>

        {/* XP counter */}
        <div className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-2 text-xs font-body font-extrabold text-amber-700 shadow-sm border border-amber-200/70 dark:border-amber-800/40 dark:text-amber-400 sm:px-3.5">
          <Star className="w-3.5 h-3.5" />
          <span>{stats.xp}</span>
        </div>

        {/* Streak counter */}
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-2 text-xs font-body font-extrabold text-primary shadow-sm border border-primary/15 sm:px-3.5">
          <Flame className="w-3.5 h-3.5" />
          <span>{stats.streak}</span>
        </div>

        {/* Notification */}
        <button className="hidden rounded-full bg-muted/75 p-2.5 transition-colors hover:bg-muted min-[360px]:inline-flex">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Theme toggle (desktop) */}
        <button
          onClick={toggleTheme}
          className="rounded-full bg-muted/75 p-2.5 transition-colors hover:bg-muted"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>

        {/* Premium badge */}
        {isPremium && (
          <span className="hidden sm:inline-flex text-[10px] font-body font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full dark:bg-amber-900/40 dark:text-amber-400">
            Cao cấp
          </span>
        )}
      </div>
    </header>
  );
}
