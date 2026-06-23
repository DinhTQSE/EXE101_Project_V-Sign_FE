import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Crown,
  GraduationCap,
  Home,
  Lock,
  LogOut,
  Moon,
  Palette,
  Search,
  ShieldCheck,
  Sun,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import logo from "@/assets/vsign-logo.png";
import PremiumModal from "@/components/PremiumModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";


export interface SidebarNavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
  adminOnly?: boolean;
}

const navItems: SidebarNavItem[] = [
  { path: "/home", label: "Trang chủ", icon: Home },
  { path: "/courses", label: "Khóa học", icon: BookOpen },
  { path: "/dictionary", label: "Từ điển", icon: Search },
  { path: "/ai-recognition", label: "Nhận diện AI", icon: Cpu },
  { path: "/assessment", label: "Thi thử", icon: GraduationCap },
  { path: "/leaderboard", label: "Bảng xếp hạng", icon: Trophy },
  { path: "/community", label: "Cộng đồng", icon: Users, comingSoon: true },
  { path: "/admin", label: "Quản trị", icon: ShieldCheck, adminOnly: true },
  { path: "/profile", label: "Hồ sơ", icon: User },
];

function isActive(currentPath: string, itemPath: string) {
  if (itemPath === "/home") return currentPath === "/home" || currentPath === "/";
  return currentPath.startsWith(itemPath);
}

function isAdminRole(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function visibleNavItems(role?: string) {
  return navItems.filter((item) => !item.adminOnly || isAdminRole(role));
}

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DesktopSidebar({ collapsed, onToggle }: DesktopSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, userName, isPremium, subscription, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [premiumOpen, setPremiumOpen] = useState(false);

  const isProUser = (profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") || 
                    (isPremium && subscription?.planType === "YEARLY");

  const displayName = profile.displayName || userName || "Người học";
  const avatarSrc = profile.avatarUrl;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-4 top-4 bottom-4 z-40 transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[256px]"
      }`}
    >
      <button
        type="button"
        className="flex h-[78px] shrink-0 items-center justify-center rounded-[28px] transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => navigate("/home")}
        aria-label="V-Sign home"
      >
        <img
          src={logo}
          alt="V-Sign"
          className={`shrink-0 object-contain drop-shadow-[0_14px_26px_rgba(214,51,108,0.24)] transition-all duration-300 ${
            collapsed ? "w-14 h-14" : "w-28 h-16"
          }`}
        />
      </button>

      <div className="app-rail flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px]">

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {visibleNavItems(profile.role).map((item) => {
          const active = isActive(location.pathname, item.path);
          const isLocked = item.path === "/ai-recognition" && !isProUser;
          return (
            <button
              key={item.path}
              onClick={() => {
                if (item.comingSoon) return;
                if (isLocked) {
                  setPremiumOpen(true);
                  return;
                }
                navigate(item.path);
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-full font-body font-bold text-sm transition-all duration-200 relative group ${
                collapsed ? "justify-center px-0 py-3" : "gap-3 justify-start px-4 py-3.5"
              } ${
                active
                  ? "black-pill"
                  : item.comingSoon
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "text-foreground hover:bg-muted/90 hover:translate-x-0.5"
              }`}
            >
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary-foreground/60" />
              )}
              <item.icon className="w-5 h-5 shrink-0" />
              <span
                className={`flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${
                  collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                }`}
              >
                {item.label}
                {isLocked && (
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                )}
                {item.comingSoon && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                    Sắp ra mắt
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-border/70 space-y-1.5 shrink-0 bg-muted/20">
        {/* Dropdown Menu for Profile, Theme & Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center rounded-full text-foreground font-body font-bold text-sm hover:bg-muted/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                collapsed ? "justify-center px-0 py-3" : "gap-3 justify-start px-4 py-3.5"
              }`}
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 ring-2 ring-primary/15"
                style={{ background: avatarSrc ? undefined : "var(--gradient-primary)" }}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <span
                className={`flex items-center gap-2 min-w-0 whitespace-nowrap transition-all duration-300 ${
                  collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                }`}
              >
                <span className="truncate max-w-[140px]">{displayName}</span>
                {isPremium && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={collapsed ? "right" : "top"}
            align={collapsed ? "center" : "end"}
            className="w-56 p-1.5 rounded-[18px] border border-border/80 bg-popover shadow-xl animate-fade-in"
          >
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-body font-bold text-foreground rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Hồ sơ cá nhân</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-body font-bold text-foreground rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span>Giao diện</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48 p-1.5 rounded-[18px] border border-border/80 bg-popover shadow-xl animate-fade-in font-body font-bold text-sm">
                  <DropdownMenuItem
                    onClick={() => setTheme("spring")}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#D6336C] border border-white/20 shrink-0" />
                    <span className={theme === "spring" ? "text-primary" : "text-foreground"}>Mùa xuân (Hồng)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("summer")}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0D9488] border border-white/20 shrink-0" />
                    <span className={theme === "summer" ? "text-primary" : "text-foreground"}>Mùa hạ (Teal)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("fall")}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#D97706] border border-white/20 shrink-0" />
                    <span className={theme === "fall" ? "text-primary" : "text-foreground"}>Mùa thu (Amber)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("winter")}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB] border border-white/20 shrink-0" />
                    <span className={theme === "winter" ? "text-primary" : "text-foreground"}>Mùa đông (Blue)</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="-mx-1.5 my-1.5 bg-border/60" />
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-muted focus:bg-muted transition-colors"
                  >
                    <Moon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className={theme === "dark" ? "text-primary" : "text-foreground"}>Chế độ tối</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="-mx-1.5 my-1.5 bg-border/60" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-body font-bold text-destructive rounded-xl cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4 text-destructive" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <span
            className={`text-xs font-body ml-1 transition-all duration-300 ${
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Thu gọn
          </span>
        </button>
      </div>
      </div>
      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </aside>
  );
}

/* ── Mobile Drawer ── */
interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, userName, isPremium, subscription, logout } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const [premiumOpen, setPremiumOpen] = useState(false);

  const isProUser = (profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") || 
                    (isPremium && subscription?.planType === "YEARLY");

  const displayName = profile.displayName || userName || "Người học";

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-card/95 backdrop-blur-xl border-r border-border z-50 flex flex-col md:hidden shadow-2xl"
          >
            <div className="p-4 flex items-center justify-between border-b border-border shrink-0 bg-gradient-to-br from-primary/5 via-card to-secondary/5">
              <img src={logo} alt="V-Sign" className="h-8" />
              <button onClick={onClose} className="p-2 rounded-[14px] hover:bg-muted">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {visibleNavItems(profile.role).map((item) => {
                const active = isActive(location.pathname, item.path);
                const isLocked = item.path === "/ai-recognition" && !isProUser;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (item.comingSoon) return;
                      if (isLocked) {
                        setPremiumOpen(true);
                        return;
                      }
                      navigate(item.path);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-full font-body font-bold text-sm transition-all relative ${
                      active
                        ? "black-pill"
                        : item.comingSoon
                        ? "text-muted-foreground/50"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="flex items-center gap-2">
                      {item.label}
                      {isLocked && (
                        <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                      )}
                      {item.comingSoon && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                          Sắp ra mắt
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-border space-y-1.5 shrink-0 bg-gradient-to-br from-card via-card to-primary/5">
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-2.5">
                <div
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 ring-2 ring-primary/15"
                  style={{ background: avatarSrc ? undefined : "var(--gradient-primary)" }}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-sm text-foreground truncate">{displayName}</p>
                  {isPremium && (
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 font-body">
                      <Crown className="w-3 h-3" /> Cao cấp
                    </span>
                  )}
                </div>
              </div>

              {/* Profile link */}
              <button
                onClick={() => {
                  navigate("/profile");
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-foreground font-body font-bold text-sm hover:bg-muted transition-colors"
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span>Hồ sơ cá nhân</span>
              </button>

              {/* Theme selection circles */}
              <div className="px-4 py-2 space-y-2">
                <p className="text-xs font-body font-bold text-muted-foreground flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Giao diện
                </p>
                <div className="flex items-center gap-3 py-1">
                  {[
                    { id: "spring", name: "Xuân", color: "#D6336C" },
                    { id: "summer", name: "Hạ", color: "#0D9488" },
                    { id: "fall", name: "Thu", color: "#D97706" },
                    { id: "winter", name: "Đông", color: "#2563EB" },
                    { id: "dark", name: "Tối", color: "#1e293b", icon: Moon },
                  ].map((t) => {
                    const active = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        title={t.name}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative ${
                          active ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: t.color }}
                      >
                        {t.icon && <t.icon className="w-4 h-4 text-white" />}
                        {active && (
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-muted-foreground font-body text-xs hover:text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                <span>Đăng xuất</span>
              </button>
            </div>
            <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>

  );
}

/* ── Mobile Bottom Nav ── */
const bottomNavItems = navItems.filter(
  (item) => ["/home", "/courses", "/dictionary", "/assessment", "/profile"].includes(item.path)
);

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 shadow-[0_-10px_30px_rgba(79,51,42,0.08)] backdrop-blur-xl md:hidden safe-area-bottom">
      {bottomNavItems.map((item) => {
        const active = isActive(location.pathname, item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative flex min-h-[60px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors font-semibold ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="w-full truncate text-center text-[10px] leading-none font-body font-medium">{item.label}</span>
            {active && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute bottom-0 h-0.5 w-10 rounded-full"
                style={{ background: "var(--gradient-primary)" }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ── Sidebar state hook ── */
export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  return {
    collapsed,
    toggleCollapsed: () => setCollapsed((v) => !v),
    mobileDrawerOpen,
    setMobileDrawerOpen,
  };
}
