import { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import {
  DesktopSidebar,
  MobileDrawer,
  MobileBottomNav,
  useSidebarState,
} from "@/components/AppSidebar";
import AppTopbar from "@/components/AppTopbar";
import StreakPopup from "@/components/StreakPopup";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed, toggleCollapsed, mobileDrawerOpen, setMobileDrawerOpen } = useSidebarState();
  const { lastReward, clearLastReward, stats } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden p-0 md:p-4">
      {/* Desktop Sidebar — fixed */}
      <DesktopSidebar collapsed={collapsed} onToggle={toggleCollapsed} />

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

      {/* Main area — offset by sidebar width */}
      <div
        className={`flex min-h-screen min-w-0 flex-col transition-all duration-300 ${
          collapsed ? "md:ml-[92px]" : "md:ml-[288px]"
        }`}
      >
        {/* Sticky Topbar */}
        <AppTopbar onMenuClick={() => setMobileDrawerOpen(true)} />

        {/* Content */}
        <main className="flex flex-1 min-h-0 min-w-0 flex-col overflow-x-hidden md:overflow-y-auto">
          <div className="safe-area-page-bottom flex w-full min-w-0 max-w-[1380px] flex-1 flex-col px-3 py-4 sm:px-4 md:mx-auto md:px-6 md:py-6 md:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Streak celebration popup */}
      <StreakPopup />

      {/* XP reward toast */}
      <AnimatePresence>
        {lastReward && (
          <XpRewardToast
            message={lastReward.message}
            xp={stats.xp}
            streak={stats.streak}
            streakChanged={stats.streakChangedToday}
            streakReset={stats.streakResetNotified}
            onDismiss={clearLastReward}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── XP Reward Toast ── */
import { useEffect } from "react";
import { motion } from "framer-motion";

function XpRewardToast({
  message,
  xp,
  streak,
  streakChanged,
  streakReset,
  onDismiss,
}: {
  message: string;
  xp: number;
  streak: number;
  streakChanged: boolean;
  streakReset: boolean;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed right-4 bottom-20 md:bottom-6 z-50 card-pastel p-4 shadow-xl border-l-4 border-primary max-w-xs"
    >
      <p className="font-display font-bold text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Tổng XP: {xp}
        {streakChanged ? ` · Streak ${streak} ngày` : ""}
      </p>
      {streakReset && (
        <p className="text-xs text-amber-700 mt-1">
          Streak cũ đã reset vì bỏ lỡ ngày học theo UTC+7.
        </p>
      )}
    </motion.div>
  );
}
