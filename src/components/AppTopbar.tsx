import { Bell, Flame, Globe, Menu, Moon, Star, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";

interface AppTopbarProps {
  onMenuClick: () => void;
}

export default function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const { stats, isPremium, profile } = useAuth();
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

      {/* Welcome Message (Replaces the search bar) */}
      <div className="hidden sm:flex items-center gap-2 font-display text-sm md:text-base">
        <span className="text-muted-foreground font-medium">Chào mừng trở lại,</span>
        <span className="font-extrabold text-gradient-vsign">{profile?.displayName || "Học viên"}</span>
        <span className="animate-bounce">👋</span>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        {/* Language indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-muted/75 border border-border/70 text-muted-foreground text-xs font-body font-bold shadow-sm">
          <Globe className="w-3.5 h-3.5" />
          Tiếng Việt
        </div>

        {/* XP counter */}
        <div className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-2 text-xs font-body font-extrabold text-amber-700 shadow-sm border border-amber-200/70 dark:border-amber-800/40 dark:text-amber-400 sm:px-3.5 hover:scale-105 transition-transform duration-200 cursor-default">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{stats.xp}</span>
        </div>

        {/* Streak counter */}
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-2 text-xs font-body font-extrabold text-primary shadow-sm border border-primary/15 sm:px-3.5 hover:scale-105 transition-transform duration-200 cursor-default">
          <Flame className="w-3.5 h-3.5 fill-primary text-primary" />
          <span>{stats.streak}</span>
        </div>

        {/* Notification */}
        <button className="hidden rounded-full bg-muted/75 p-2.5 transition-all duration-200 hover:bg-muted hover:scale-105 active:scale-95 min-[360px]:inline-flex">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Theme toggle (desktop) */}
        <button
          onClick={toggleTheme}
          className="rounded-full bg-muted/75 p-2.5 transition-all duration-200 hover:bg-muted hover:scale-105 active:scale-95"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-500 fill-amber-400/20" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 fill-slate-200/20" />
          )}
        </button>

        {/* Premium badge */}
        {isPremium && (
          <span className="hidden sm:inline-flex text-[9px] font-body font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-400/30 shadow-sm px-2.5 py-1.5 rounded-full hover:scale-105 transition-transform duration-200 cursor-default uppercase tracking-wider">
            Cao cấp
          </span>
        )}
      </div>
    </header>
  );
}
