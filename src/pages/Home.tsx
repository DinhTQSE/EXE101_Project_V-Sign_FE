import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  Cpu,
  Flame,
  GraduationCap,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import mascotImg from "@/assets/mascot.png";
import { learningApi, UnitSummaryDto } from "@/services/vsignApi";

function xpToLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}
function xpInCurrentLevel(xp: number) {
  return xp % 100;
}

export default function Home() {
  const { profile, userName, stats, onboardingResponses } = useAuth();
  const navigate = useNavigate();
  const [recentUnits, setRecentUnits] = useState<UnitSummaryDto[]>([]);

  const displayName = profile.displayName || userName || "bạn";
  const level = xpToLevel(stats.xp);
  const levelProgress = xpInCurrentLevel(stats.xp);
  const xpToNext = 100 - levelProgress;

  const dailyGoalStr = onboardingResponses.dailyTime || "10 phút";
  const goalMinutes = parseInt(dailyGoalStr) || 10;
  const learnedMinutes = Math.min(stats.totalMinutes, goalMinutes);
  const dailyPercent = Math.round((learnedMinutes / goalMinutes) * 100);

  useEffect(() => {
    learningApi
      .listUnits()
      .then((units) => setRecentUnits(units.slice(0, 4)))
      .catch(() => {});
  }, []);

  const quickActions = [
    { label: "Tiếp tục học", desc: "Bài học gần nhất", icon: BookOpen, color: "bg-primary/10 text-primary", path: "/courses" },
    { label: "Nhận diện AI", desc: "Camera AI", icon: Cpu, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400", path: "/ai-recognition" },
    { label: "Ôn tập từ vựng", desc: "Từ điển ký hiệu", icon: Search, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400", path: "/dictionary" },
    { label: "Thi thử", desc: "Kiểm tra trình độ", icon: GraduationCap, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400", path: "/assessment" },
  ];

  return (
    /* flex-1 + min-h-0 fill the height DashboardLayout propagates */
    <div className="flex-1 min-h-0 w-full grid grid-cols-5 gap-4">

      {/* ═══ LEFT COLUMN (3/5) — hero · stats · daily progress ═══ */}
      <div className="col-span-3 flex flex-col gap-3 min-h-0">

        {/* Hero banner */}
        <div className="hero-panel p-4 md:p-5 flex items-center gap-4 overflow-hidden">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 mb-2 rounded-full bg-white/92 px-3 py-1 text-xs font-extrabold text-foreground shadow-sm">
              <Sparkles className="w-3 h-3 text-primary" /> Hôm nay học gì?
            </span>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white leading-tight mb-1 truncate">
              Chào mừng trở lại, {displayName}! 👋
            </h1>
            <p className="font-body text-sm text-white/85">
              Giữ vững chuỗi học và nhận phần thưởng mỗi ngày.
            </p>
          </div>
          <motion.img
            src={mascotImg} alt="V-Sign Mascot"
            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl shrink-0 hidden sm:block"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Streak + XP — side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="card-pop p-4 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="icon-tile !w-11 !h-11 shrink-0" style={{ background: "var(--gradient-primary)" }}>
                <Flame className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Streak hiện tại</p>
                <p className="font-display font-extrabold text-3xl text-foreground leading-none">
                  {stats.streak} <span className="text-base">ngày</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              Cao nhất: {stats.longestStreak} ngày
            </div>
          </motion.div>

          {/* XP + Level */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="card-pop p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="icon-tile !w-11 !h-11 bg-amber-50 dark:bg-amber-900/20 shrink-0">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Tổng XP</p>
                  <p className="font-display font-extrabold text-3xl text-foreground leading-none">{stats.xp}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-body font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                <Sparkles className="w-3 h-3" /> Level {level}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-body text-muted-foreground mb-1">
                <span>Tiến độ lên level {level + 1}</span>
                <span>Còn {xpToNext} XP</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelProgress}%`, background: "var(--gradient-primary)" }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Daily progress */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-pop p-4 flex items-center gap-4">
          <div className="icon-tile !w-11 !h-11 shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-extrabold text-foreground mb-1">Tiến độ ngày</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyPercent}%`, background: "var(--gradient-primary)" }} />
              </div>
              <span className="text-xs text-muted-foreground font-body font-semibold shrink-0">
                {learnedMinutes}/{goalMinutes} phút
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ RIGHT COLUMN (2/5) — quick actions · continue learning ═══ */}
      <div className="col-span-2 flex flex-col gap-3 min-h-0">

        {/* Quick actions */}
        <div>
          <h2 className="font-display font-extrabold text-lg text-foreground mb-2">Bắt đầu nhanh</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.04 }}
                onClick={() => navigate(action.path)}
                className="card-pop p-4 flex flex-col items-center text-center group hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className={`icon-tile !w-11 !h-11 mb-2 group-hover:scale-110 transition-transform ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-display font-extrabold text-foreground text-sm mb-0.5">{action.label}</span>
                <span className="font-body text-[11px] text-muted-foreground">{action.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Continue learning */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-extrabold text-lg text-foreground">Tiếp tục khóa học</h2>
            <button onClick={() => navigate("/courses")}
              className="flex items-center gap-1 text-xs font-body font-semibold text-primary hover:underline">
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
            {recentUnits.length === 0 ? (
              <div className="card-pop p-4 flex items-center gap-3 text-muted-foreground">
                <BookOpen className="w-5 h-5 shrink-0" />
                <span className="font-body text-sm">Đang tải khóa học...</span>
              </div>
            ) : recentUnits.map((unit, index) => (
              <motion.button
                key={unit.unitId}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.04 }}
                onClick={() => navigate("/courses")}
                className="card-pop p-4 flex items-center gap-3 text-left hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
              >
                <div className="icon-tile shrink-0" style={{ background: "var(--gradient-primary)" }}>
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary mb-0.5">
                    UNIT {unit.orderIndex || index + 1}
                  </span>
                  <h3 className="font-display font-extrabold text-foreground text-sm truncate">{unit.title}</h3>
                  {unit.description && (
                    <p className="text-[11px] text-muted-foreground font-body truncate">{unit.description}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
