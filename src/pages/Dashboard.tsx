import { lazy, Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Trophy, Users, LogOut, Menu, X, User, GraduationCap, Cpu, Crown, Lock, Sun, Moon, Search, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import logo from "@/assets/vsign-logo.png";
import mascotImg from "@/assets/mascot.png";

const VocabularyPack = lazy(() => import("@/pages/VocabularyPack"));
const Profile = lazy(() => import("@/pages/Profile"));
const AssessmentExam = lazy(() => import("@/pages/AssessmentExam"));
const Dictionary = lazy(() => import("@/pages/Dictionary"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const PremiumModal = lazy(() => import("@/components/PremiumModal"));
const PracticeView = lazy(() => import("@/components/PracticeView"));

function DailyProgressWidget() {
  const { onboardingResponses, stats } = useAuth();
  const dailyGoalStr = onboardingResponses.dailyTime || "10 phút";
  const goalMinutes = parseInt(dailyGoalStr) || 10;
  const learnedMinutes = Math.min(stats.totalMinutes, goalMinutes);
  const percent = Math.round((learnedMinutes / goalMinutes) * 100);

  return (
    <div className="card-pastel p-4 mb-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-primary)" }}>
        <Clock className="w-6 h-6 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display font-bold text-foreground">Tiến độ ngày</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: "var(--gradient-primary)" }} />
          </div>
          <span className="text-xs text-muted-foreground font-body font-semibold shrink-0">{learnedMinutes}/{goalMinutes} phút</span>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: "courses", label: "Khóa học", icon: BookOpen },
  { id: "dictionary", label: "Từ điển", icon: Search },
  { id: "leaderboard", label: "Xếp hạng", icon: Trophy },
  { id: "assessment", label: "Thi thử", icon: GraduationCap },
  { id: "community", label: "Cộng đồng", icon: Users, comingSoon: true },
  { id: "ai-camera", label: "Nhận diện AI", icon: Cpu },
  { id: "profile", label: "Hồ sơ", icon: User },
] as const;

type TabId = (typeof tabs)[number]["id"];
type DashboardTab = (typeof tabs)[number] & { premium?: boolean; comingSoon?: boolean };

const isPremiumTab = (tab?: (typeof tabs)[number]) => Boolean((tab as DashboardTab | undefined)?.premium);
const isComingSoonTab = (tab?: (typeof tabs)[number]) => Boolean((tab as DashboardTab | undefined)?.comingSoon);

// Bottom nav tabs for mobile
const bottomNavTabs = ["courses", "dictionary", "leaderboard", "assessment", "profile"] as const;

interface DashboardProps {
  defaultTab?: string;
}

export default function Dashboard({ defaultTab = "courses" }: DashboardProps) {
  const location = useLocation();
  const routeState = location.state as { defaultTab?: TabId; openPremium?: boolean; practiceSign?: string } | null;
  const [activeTab, setActiveTab] = useState<TabId>((routeState?.defaultTab || defaultTab) as TabId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const { userName, logout, profile, layoutMode, isPremium, lastReward, clearLastReward, stats } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isChildMode = layoutMode === "child";

  const handleLogout = () => { logout(); navigate("/"); };

  useEffect(() => {
    if (routeState?.defaultTab) setActiveTab(routeState.defaultTab);
    if (routeState?.openPremium) setPremiumOpen(true);
  }, [routeState?.defaultTab, routeState?.openPremium]);

  useEffect(() => {
    if (!lastReward) return;
    const t = setTimeout(clearLastReward, 3200);
    return () => clearTimeout(t);
  }, [clearLastReward, lastReward]);

  const handleTabChange = (tabId: TabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (isPremiumTab(tab) && !isPremium) {
      setPremiumOpen(true);
      return;
    }
    if (isComingSoonTab(tab)) return;
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  const mascotMessages: Record<string, string> = {
    courses: isChildMode
      ? `Chào bạn nhỏ! 🌈 Chọn khóa học để bắt đầu nhé! ✨`
      : `Chào ${userName || "bạn"}! Chọn khóa học để bắt đầu! 🗺️`,
    dictionary: "Tra cứu ký hiệu bất kỳ trong từ điển VSL! 📖🔍",
    leaderboard: "Cùng thi đua với bạn bè nào! 🏆🔥",
    assessment: "Bình tĩnh và tự tin nhé! 📝",
    community: "Kết nối với cộng đồng! 🤝",
    "ai-camera": "Luyện tập ký hiệu với camera AI.",
    profile: `Xem tiến trình của bạn nào! 📊`,
  };

  const displayName = profile.displayName || userName || "Người học mới";
  const avatarSrc = profile.avatarUrl;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className={`hidden md:flex ${sidebarOpen ? "w-64" : "w-[72px]"} bg-card border-r border-border transition-all duration-300 ease-in-out flex-col overflow-hidden shrink-0`}>
        <div className="p-4 flex items-center justify-center border-b border-border cursor-pointer transition-all duration-300 ease-in-out" onClick={() => handleTabChange("courses")}>
          <img src={logo} alt="V-Sign" className={`shrink-0 object-contain transition-all duration-300 ease-in-out hover:scale-105 ${sidebarOpen ? "w-16 h-16" : "w-8 h-8"}`} />
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {tabs.map((tab) => {
            const isPro = isPremiumTab(tab);
            const isComingSoon = isComingSoonTab(tab);

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                title={!sidebarOpen ? tab.label : undefined}
                className={`w-full flex items-center rounded-2xl font-body font-medium text-sm transition-all duration-300 ease-in-out relative ${
                  sidebarOpen ? "gap-3 justify-start px-4 py-3" : "justify-center px-0 py-3"
                } ${
                  activeTab === tab.id
                    ? "text-primary-foreground shadow-md"
                    : isComingSoon
                    ? "text-muted-foreground/60 cursor-not-allowed"
                    : isPro && !isPremium
                    ? "text-muted-foreground hover:bg-muted"
                    : "text-foreground hover:bg-muted"
                }`}
                style={activeTab === tab.id ? { background: "var(--gradient-primary)" } : undefined}
              >
                {activeTab === tab.id && sidebarOpen && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-foreground rounded-full -ml-1" />
                )}
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className={`flex items-center gap-2 whitespace-nowrap transition-all duration-300 ease-in-out ${
                  sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                }`}>
                  {tab.label}
                  {isPro && !isPremium && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 dark:bg-amber-900/40 dark:text-amber-400">
                      <Lock className="w-2.5 h-2.5 shrink-0" /> Cao cấp
                    </span>
                  )}
                  {isComingSoon && (
                    <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full whitespace-nowrap">Sắp ra mắt</span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          {!isPremium && (
            <button
              onClick={() => setPremiumOpen(true)}
              title={!sidebarOpen ? "Nâng cấp Premium" : undefined}
              className={`w-full flex items-center rounded-2xl font-body font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md shadow-amber-500/10 ${
                sidebarOpen ? "gap-3 justify-start px-4 py-3" : "justify-center px-0 py-3"
              }`}
            >
              <Crown className="w-5 h-5 shrink-0 animate-pulse text-amber-100" />
              <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
                Nâng cấp Premium
              </span>
            </button>
          )}
          <button onClick={toggleTheme}
            title={!sidebarOpen ? (theme === "dark" ? "Chế độ sáng" : "Chế độ tối") : undefined}
            className={`w-full flex items-center rounded-2xl text-foreground font-body font-medium text-sm hover:bg-muted transition-all duration-300 ease-in-out ${
              sidebarOpen ? "gap-3 justify-start px-4 py-3" : "justify-center px-0 py-3"
            }`}>
            {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
              {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            </span>
          </button>

          <button onClick={() => handleTabChange("profile")}
            className={`w-full flex items-center rounded-2xl text-foreground font-body font-medium text-sm hover:bg-muted transition-all duration-300 ease-in-out ${
              sidebarOpen ? "gap-3 justify-start px-4 py-3" : "justify-center px-0 py-3"
            }`}>
            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
              style={{ background: avatarSrc ? undefined : "var(--gradient-primary)" }}>
              {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
            </div>
            <span className={`flex items-center gap-2 min-w-0 whitespace-nowrap transition-all duration-300 ease-in-out ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
              <span className="truncate">{displayName}</span>
              {isPremium && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
            </span>
          </button>

          <button onClick={handleLogout}
            title={!sidebarOpen ? "Đăng xuất" : undefined}
            className={`w-full flex items-center rounded-2xl text-destructive font-body font-medium text-sm hover:bg-destructive/10 transition-all duration-300 ease-in-out ${
              sidebarOpen ? "gap-3 justify-start px-4 py-3" : "justify-center px-0 py-3"
            }`}>
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ease-in-out ${sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col md:hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-border">
                <img src={logo} alt="V-Sign" className="h-8" />
                <button onClick={() => setMobileDrawerOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {tabs.map((tab) => {
                  const isPro = isPremiumTab(tab);
                  const isComingSoon = isComingSoonTab(tab);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-body font-medium text-sm transition-all relative ${
                        activeTab === tab.id
                          ? "text-primary-foreground shadow-md"
                          : isComingSoon ? "text-muted-foreground/60"
                          : "text-foreground hover:bg-muted"
                      }`}
                      style={activeTab === tab.id ? { background: "var(--gradient-primary)" } : undefined}
                    >
                      <tab.icon className="w-5 h-5 shrink-0" />
                      <span className="flex items-center gap-2">
                        {tab.label}
                        {isPro && !isPremium && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 dark:bg-amber-900/40 dark:text-amber-400">
                            <Lock className="w-2.5 h-2.5" /> Cao cấp
                          </span>
                        )}
                        {isComingSoon && (
                          <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full">Sắp ra mắt</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-border space-y-1">
                {!isPremium && (
                  <button
                    onClick={() => {
                      setPremiumOpen(true);
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-body font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-colors shadow-md shadow-amber-500/10"
                  >
                    <Crown className="w-5 h-5 animate-pulse text-amber-100" />
                    <span>Nâng cấp Premium</span>
                  </button>
                )}
                <button onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-foreground font-body font-medium text-sm hover:bg-muted transition-colors">
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}</span>
                </button>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-destructive font-body font-medium text-sm hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-5 h-5" /> <span>Đăng xuất</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card shrink-0">
          {/* Mobile: hamburger, Desktop: sidebar toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block p-2 rounded-lg hover:bg-muted transition-colors">
            {sidebarOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
          <button onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <img src={logo} alt="V-Sign" className="h-7 md:hidden" />
          <h1 className={`font-display font-bold text-foreground hidden md:block ${isChildMode ? "text-xl" : "text-lg"}`}>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme toggle in header (mobile-friendly) */}
            <button onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden">
              {theme === "dark" ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
            </button>
            {isPremium && (
              <span className="text-xs font-body font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1 dark:bg-amber-900/40 dark:text-amber-400">
                <Crown className="w-3.5 h-3.5" /> Cao cấp
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-6">
            {/* Daily Progress Widget */}
            {activeTab === "courses" && (
              <>
                {routeState?.practiceSign && (
                  <div className="card-pastel p-4 mb-4 border-l-4 border-primary">
                    <p className="text-sm font-body text-foreground">
                      Gợi ý luyện tập từ từ điển: <span className="font-display font-bold">{routeState.practiceSign}</span>
                    </p>
                  </div>
                )}
                <DailyProgressWidget />
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Đang tải...</div>}>
                {activeTab === "courses" && <VocabularyPack />}
                {activeTab === "dictionary" && <Dictionary />}
                {activeTab === "leaderboard" && <Leaderboard />}
                
                {activeTab === "assessment" && <AssessmentExam />}
                {activeTab === "profile" && <Profile />}
                {activeTab === "ai-camera" && <PracticeView />}
                {activeTab === "community" && (
                  <div className="max-w-2xl mx-auto text-center py-16">
                    <Users className="w-16 h-16 text-secondary mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                      Cộng đồng
                    </h2>
                    <p className="text-muted-foreground font-body">Cộng đồng học tập sẽ sớm được mở cho người dùng.</p>
                  </div>
                )}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          {!["courses", "profile", "assessment"].includes(activeTab) && (
            <aside className="hidden lg:flex w-72 border-l border-border bg-card flex-col p-4 shrink-0 overflow-y-auto">
              <div className="guide-panel flex flex-col items-center text-center mb-4">
                <motion.img src={mascotImg} alt="V-Sign Guide" className={`object-contain mb-3 drop-shadow-lg ${isChildMode ? "w-28 h-28" : "w-24 h-24"}`}
                  animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                <div className="speech-bubble w-full">
                  <p className={`font-body text-foreground leading-relaxed ${isChildMode ? "text-base" : "text-sm"}`}>
                    {mascotMessages[activeTab]}
                  </p>
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex md:hidden z-40 safe-area-bottom">
        {bottomNavTabs.map((tabId) => {
          const tab = tabs.find(t => t.id === tabId)!;
          const isActive = activeTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => handleTabChange(tabId)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 min-h-[56px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-body font-medium">{tab.label}</span>
              {isActive && (
                <motion.div layoutId="bottomNavIndicator" className="absolute bottom-0 h-0.5 w-10 rounded-full" style={{ background: "var(--gradient-primary)" }} />
              )}
            </button>
          );
        })}
      </nav>

      <Suspense fallback={null}>
        <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      </Suspense>
      <AnimatePresence>
        {lastReward && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-4 bottom-20 md:bottom-6 z-50 card-pastel p-4 shadow-xl border-l-4 border-primary max-w-xs"
          >
            <p className="font-display font-bold text-foreground">{lastReward.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng XP: {stats.xp}{stats.streakChangedToday ? ` · Streak ${stats.streak} ngày` : ""}
            </p>
            {stats.streakResetNotified && (
              <p className="text-xs text-amber-700 mt-1">Streak cũ đã reset vì bỏ lỡ ngày học theo UTC+7.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
