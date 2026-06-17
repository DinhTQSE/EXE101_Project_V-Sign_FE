import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Flame,
  GraduationCap,
  Hand,
  PlayCircle,
  Route,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import mascotImg from "@/assets/mascot.png";
import { cn } from "@/lib/utils";
import { learningApi, UnitSummaryDto } from "@/services/vsignApi";

type IconTone = {
  tile: string;
  soft: string;
  text: string;
  glow: string;
  ring: string;
};

type SubjectCard = {
  title: string;
  description: string;
};

const iconTones: Record<string, IconTone> = {
  rose: {
    tile: "bg-gradient-to-br from-rose-500 via-pink-500 to-rose-300",
    soft: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-200",
    text: "text-rose-600",
    glow: "bg-rose-300/28",
    ring: "ring-rose-100 dark:ring-rose-500/20",
  },
  violet: {
    tile: "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-300",
    soft: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-200",
    text: "text-fuchsia-600",
    glow: "bg-fuchsia-300/24",
    ring: "ring-fuchsia-100 dark:ring-fuchsia-500/20",
  },
  emerald: {
    tile: "bg-gradient-to-br from-teal-500 via-emerald-400 to-teal-200",
    soft: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-200",
    text: "text-teal-600",
    glow: "bg-teal-300/24",
    ring: "ring-teal-100 dark:ring-teal-500/20",
  },
  amber: {
    tile: "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-300",
    soft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
    text: "text-amber-600",
    glow: "bg-amber-300/24",
    ring: "ring-amber-100 dark:ring-amber-500/20",
  },
  sky: {
    tile: "bg-gradient-to-br from-teal-500 via-cyan-400 to-emerald-300",
    soft: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200",
    text: "text-cyan-600",
    glow: "bg-cyan-300/22",
    ring: "ring-cyan-100 dark:ring-cyan-500/20",
  },
};

const homeCardClass =
  "card-pop border-rose-100/90 bg-gradient-to-br from-white via-rose-50/70 to-pink-50/45 dark:border-border/80 dark:from-card dark:via-card dark:to-card";

const homeInnerCardClass =
  "rounded-[26px] border border-rose-100/90 bg-gradient-to-br from-white via-rose-50/45 to-white shadow-sm dark:border-border/75 dark:from-card dark:via-card dark:to-card";

const fallbackSubjects: SubjectCard[] = [
  {
    title: "Giao tiếp hằng ngày",
    description: "Chào hỏi, xưng hô, gia đình và sinh hoạt thường gặp.",
  },
  {
    title: "Cảm xúc",
    description: "Nhận biết và diễn đạt cảm xúc cơ bản bằng ký hiệu.",
  },
  {
    title: "Món ăn thường ngày",
    description: "Từ vựng gần gũi cho bữa ăn, quán ăn và đồ uống.",
  },
];

function xpToLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function xpInCurrentLevel(xp: number) {
  return xp % 100;
}

function ColorIcon({
  icon: Icon,
  tone,
  className,
  iconClassName,
}: {
  icon: LucideIcon;
  tone: IconTone;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-white shadow-lg", tone.tile, className)}>
      <span className={cn("absolute inset-0 translate-y-3 rounded-[22px] blur-xl", tone.glow)} />
      <Icon className={cn("relative h-5 w-5", iconClassName)} />
    </div>
  );
}

function SoftIcon({
  icon: Icon,
  tone,
}: {
  icon: LucideIcon;
  tone: IconTone;
}) {
  return (
    <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ring-1", tone.soft, tone.ring)}>
      <Icon className="h-4 w-4" />
    </span>
  );
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
  const goalMinutes = parseInt(dailyGoalStr, 10) || 10;
  const learnedMinutes = Math.min(stats.totalMinutes, goalMinutes);
  const dailyPercent = Math.min(100, Math.round((learnedMinutes / goalMinutes) * 100));
  const hasStarted = stats.xp > 0 || stats.totalMinutes > 0 || stats.completedLessons.length > 0;

  useEffect(() => {
    learningApi
      .listUnits()
      .then((units) => setRecentUnits(units.slice(0, 4)))
      .catch(() => {});
  }, []);

  const subjectCards = useMemo<SubjectCard[]>(() => {
    if (recentUnits.length === 0) return fallbackSubjects;
    return recentUnits.slice(0, 3).map((unit) => ({
      title: unit.title,
      description: unit.description || "Bắt đầu với các ký hiệu gần gũi và dễ luyện tập.",
    }));
  }, [recentUnits]);

  const primarySubject = subjectCards[0];

  const todayPlan = [
    {
      label: "Học một bài mới",
      desc: primarySubject ? `Bắt đầu với ${primarySubject.title}` : "Chọn chủ đề đầu tiên",
      icon: BookOpen,
      tone: iconTones.rose,
      done: stats.completedLessons.length > 0,
    },
    {
      label: "Luyện ký hiệu bằng AI",
      desc: "Thực hành trước camera trong vài phút",
      icon: Hand,
      tone: iconTones.violet,
      done: false,
    },
    {
      label: "Ôn lại từ vựng",
      desc: "Củng cố các ký hiệu dễ quên",
      icon: Search,
      tone: iconTones.emerald,
      done: false,
    },
  ];

  const quickActions = [
    {
      label: hasStarted ? "Tiếp tục học" : "Bắt đầu bài học",
      desc: primarySubject?.title || "Chủ đề đầu tiên",
      icon: BookOpen,
      tone: iconTones.rose,
      path: "/courses",
      featured: true,
    },
    {
      label: "Nhận diện AI",
      desc: "Luyện ký hiệu với camera",
      icon: Cpu,
      tone: iconTones.violet,
      path: "/ai-recognition",
    },
    {
      label: "Từ điển ký hiệu",
      desc: "Tra cứu và ôn tập",
      icon: Search,
      tone: iconTones.emerald,
      path: "/dictionary",
    },
    {
      label: "Thi thử",
      desc: "Kiểm tra trình độ",
      icon: GraduationCap,
      tone: iconTones.amber,
      path: "/assessment",
    },
  ];

  const [featuredAction, ...secondaryActions] = quickActions;

  const statsCards = [
    { label: "Chuỗi học", value: `${stats.streak} ngày`, icon: Flame, tone: iconTones.rose, detail: `Cao nhất ${stats.longestStreak} ngày` },
    { label: "Tổng XP", value: stats.xp.toString(), icon: Star, tone: iconTones.amber, detail: `Còn ${xpToNext} XP` },
    { label: "Cấp độ", value: `Cấp ${level}`, icon: Trophy, tone: iconTones.sky, detail: `Lên cấp ${level + 1}` },
  ];

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-5">
      <section className="hero-panel grid gap-5 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <div className="min-w-0">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1 text-xs font-extrabold text-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Lộ trình học hôm nay
          </span>
          <h1 className="max-w-2xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Sẵn sàng học {goalMinutes} phút, {displayName}?
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/88 md:text-base">
            Chọn một chủ đề, luyện ký hiệu bằng AI và giữ nhịp học đều mỗi ngày.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
              <Target className="h-3.5 w-3.5" />
              Mục tiêu {goalMinutes} phút
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
              <Cpu className="h-3.5 w-3.5" />
              AI sẵn sàng
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-2 min-[440px]:flex-row">
            <button
              onClick={() => navigate("/courses")}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-white px-5 py-3 font-display text-sm font-extrabold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <PlayCircle className="h-4 w-4" />
              Bắt đầu học
            </button>
            <button
              onClick={() => navigate("/ai-recognition")}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-white/55 bg-white/16 px-5 py-3 font-display text-sm font-extrabold text-white backdrop-blur transition-transform hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4" />
              Luyện với AI
            </button>
          </div>
        </div>

        <div className="relative hidden min-h-[190px] items-end justify-center lg:flex">
          <div className="absolute bottom-1 right-8 h-32 w-44 rounded-[34px] border border-white/24 bg-white/12 backdrop-blur-sm" />
          <motion.img
            src={mascotImg}
            alt="V-Sign Mascot"
            className="relative z-10 h-40 w-40 object-contain drop-shadow-2xl"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="min-w-0 space-y-4">
          <section className={cn(homeCardClass, "p-4 md:p-5")}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <SoftIcon icon={Route} tone={iconTones.sky} />
                  <h2 className="font-display text-xl font-extrabold text-foreground">Lộ trình hôm nay</h2>
                </div>
                <p className="text-sm text-muted-foreground">Hoàn thành từng bước nhỏ để tạo thói quen học đều.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                <CalendarCheck className="h-3.5 w-3.5" />
                {learnedMinutes}/{goalMinutes} phút
              </span>
            </div>

            <div className="mb-5 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-400 via-rose-400 to-pink-500 transition-all duration-700" style={{ width: `${dailyPercent}%` }} />
              </div>
              <span className="text-xs font-extrabold text-muted-foreground">{dailyPercent}%</span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {todayPlan.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index }}
                  onClick={() => navigate(index === 1 ? "/ai-recognition" : index === 2 ? "/dictionary" : "/courses")}
                  className={cn(homeInnerCardClass, "group p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg")}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <ColorIcon icon={item.icon} tone={item.tone} />
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    )}
                  </div>
                  <h3 className="font-display text-base font-extrabold leading-tight text-foreground">{item.label}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </motion.button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-foreground">Bắt đầu nhanh</h2>
              <button
                onClick={() => navigate("/courses")}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Xem chủ đề <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.12fr)_minmax(230px,0.88fr)]">
              <motion.button
                key={featuredAction.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                onClick={() => navigate(featuredAction.path)}
                className={cn(homeCardClass, "group min-w-0 p-5 text-left transition-all hover:-translate-y-1 hover:ring-2", featuredAction.tone.ring)}
              >
                <div className="flex h-full min-h-[150px] flex-col justify-between gap-5 sm:min-h-[170px]">
                  <div className="flex items-start justify-between gap-4">
                    <ColorIcon icon={featuredAction.icon} tone={featuredAction.tone} className="h-16 w-16" iconClassName="h-7 w-7" />
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">Ưu tiên</span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-extrabold leading-tight text-foreground">{featuredAction.label}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{featuredAction.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-primary">
                      Vào học ngay <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </motion.button>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {secondaryActions.map((action, index) => (
                <motion.button
                  key={action.path}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.04 }}
                  onClick={() => navigate(action.path)}
                    className={cn(homeCardClass, "group min-w-0 p-4 text-left transition-all hover:-translate-y-1 hover:ring-2", action.tone.ring)}
                >
                    <div className="flex items-center gap-3 lg:items-start">
                      <ColorIcon icon={action.icon} tone={action.tone} className="h-12 w-12" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base font-extrabold leading-tight text-foreground">{action.label}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{action.desc}</p>
                        <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                </motion.button>
              ))}
              </div>
            </div>
          </section>

          <section className={cn(homeCardClass, "p-4 md:p-5")}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold text-foreground">
                  {hasStarted ? "Tiếp tục học" : "Chủ đề nên bắt đầu"}
                </h2>
                <p className="text-sm text-muted-foreground">Các chủ đề nền tảng để học nhanh và dễ luyện tập.</p>
              </div>
              <button
                onClick={() => navigate("/courses")}
                className="hidden shrink-0 items-center gap-1 text-xs font-bold text-primary hover:underline sm:inline-flex"
              >
                Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {subjectCards.map((unit, index) => {
                const tone = [iconTones.rose, iconTones.sky, iconTones.amber][index % 3];
                return (
                  <motion.button
                    key={`${unit.title}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 + index * 0.04 }}
                    onClick={() => navigate("/courses")}
                    className={cn(homeInnerCardClass, "group p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg")}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <ColorIcon icon={BookOpen} tone={tone} />
                      <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold", tone.soft)}>
                        Chủ đề {index + 1}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-extrabold leading-tight text-foreground">{unit.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{unit.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">Bài học cơ bản</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {statsCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.04 }}
                className={cn(homeCardClass, "p-4")}
              >
                <div className="flex items-center gap-3">
                  <ColorIcon icon={card.icon} tone={card.tone} className="h-11 w-11" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{card.label}</p>
                    <p className="truncate font-display text-2xl font-extrabold text-foreground">{card.value}</p>
                    <p className="truncate text-xs text-muted-foreground">{card.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          <section className={cn(homeCardClass, "overflow-hidden")}>
            <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-orange-300 p-5 text-white">
              <div className="mb-8 flex items-center justify-between">
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-extrabold backdrop-blur">Ký hiệu hôm nay</span>
                <Hand className="h-6 w-6" />
              </div>
              <h2 className="font-display text-3xl font-extrabold leading-tight">Xin chào</h2>
              <p className="mt-1 text-sm font-medium text-white/85">Một ký hiệu đơn giản để bắt đầu giao tiếp.</p>
            </div>
            <div className="p-4">
              <div className="mb-4 flex items-center gap-3">
                <SoftIcon icon={BadgeCheck} tone={iconTones.emerald} />
                <p className="text-sm font-semibold leading-relaxed text-foreground">
                  Luyện trước camera để AI nhận diện và phản hồi ngay.
                </p>
              </div>
              <button
                onClick={() => navigate("/ai-recognition")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-foreground px-4 py-3 font-display text-sm font-extrabold text-background transition-transform hover:-translate-y-0.5"
              >
                Luyện ký hiệu này
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
