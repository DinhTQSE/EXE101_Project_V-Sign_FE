import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BookOpen,
  Check,
  ChevronRight,
  Cpu,
  Search,
  Shuffle,
  Smile,
  Sparkles,
  Users,
  Utensils,
  Video,
  Crown,
  type LucideIcon,
} from "lucide-react";
import AiCameraPractice from "@/components/AiCameraPractice";
import VideoPlayer from "@/components/VideoPlayer";
import {
  AI_PRACTICE_CATEGORIES,
  AI_PRACTICE_TARGETS,
  AiPracticeFilter,
  AiPracticeTarget,
  normalizeAiLabel,
  resolveAiPracticeTarget,
} from "@/services/aiRecognition";
import { dictionaryApi, DictionaryEntryDto } from "@/services/vsignApi";
import { useAuth } from "@/contexts/AuthContext";
import PremiumGate from "@/components/PremiumGate";
import PremiumModal from "@/components/PremiumModal";


const CATEGORY_ICONS: Record<AiPracticeFilter, LucideIcon> = {
  recommended: Sparkles,
  family: Users,
  emotion: Smile,
  food: Utensils,
};

let dictionaryVideoEntriesCache: DictionaryEntryDto[] | null = null;

function findTargetIndex(target?: AiPracticeTarget | null) {
  if (!target) return 0;
  const index = AI_PRACTICE_TARGETS.findIndex((item) => item.label === target.label);
  return index >= 0 ? index : 0;
}

function targetMeta(target: AiPracticeTarget) {
  const category = AI_PRACTICE_CATEGORIES.find((item) => item.id === target.category);
  return [category?.label, target.region].filter(Boolean).join(" · ");
}

function findMatchingVideoEntry(target: AiPracticeTarget, entries: DictionaryEntryDto[]) {
  const keys = [
    target.display,
    target.gloss,
    target.label,
    target.region,
    ...(target.aliases || []),
  ]
    .map(normalizeAiLabel)
    .filter(Boolean);

  const withVideo = entries.filter((entry) => Boolean(entry.videoUrl));
  return (
    withVideo.find((entry) => {
      const fields = [entry.word, entry.keyword, entry.description].map(normalizeAiLabel).filter(Boolean);
      return fields.some((field) => keys.some((key) => field === key || field.includes(key) || key.includes(field)));
    }) || withVideo[0] || null
  );
}

async function loadSampleVideoEntry(target: AiPracticeTarget) {
  const directEntries = await dictionaryApi
    .listEntries({ keyword: target.display, size: 20 })
    .catch(() => []);
  const directMatch = findMatchingVideoEntry(target, directEntries);
  if (directMatch) return directMatch;

  if (!dictionaryVideoEntriesCache) {
    const allEntries = await dictionaryApi.listEntries({ size: 100 }).catch(() => []);
    dictionaryVideoEntriesCache = allEntries.filter((entry) => Boolean(entry.videoUrl));
  }

  return findMatchingVideoEntry(target, dictionaryVideoEntriesCache);
}

export default function PracticeView() {
  const { profile, isPremium, subscription } = useAuth();
  const [premiumOpen, setPremiumOpen] = useState(false);

  const isProUser = (profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") || 
                    (isPremium && subscription?.planType === "YEARLY");

  const location = useLocation();
  const practiceSign = (location.state as { practiceSign?: string } | null)?.practiceSign;
  const preferredTarget = useMemo(() => resolveAiPracticeTarget(practiceSign), [practiceSign]);
  const [targetIndex, setTargetIndex] = useState(() => findTargetIndex(preferredTarget));
  const [activeCategory, setActiveCategory] = useState<AiPracticeFilter>(preferredTarget?.category || "recommended");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [sampleEntry, setSampleEntry] = useState<DictionaryEntryDto | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  useEffect(() => {
    if (!preferredTarget) return;
    setTargetIndex(findTargetIndex(preferredTarget));
    setActiveCategory(preferredTarget.category);
  }, [preferredTarget]);

  const current = AI_PRACTICE_TARGETS[targetIndex] || AI_PRACTICE_TARGETS[0];

  useEffect(() => {
    let cancelled = false;
    setSampleLoading(true);
    setSampleEntry(null);

    loadSampleVideoEntry(current)
      .then((entry) => {
        if (cancelled) return;
        setSampleEntry(entry);
      })
      .catch(() => {
        if (!cancelled) setSampleEntry(null);
      })
      .finally(() => {
        if (!cancelled) setSampleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [current]);

  const categoryInfo = AI_PRACTICE_CATEGORIES.find((item) => item.id === activeCategory) || AI_PRACTICE_CATEGORIES[0];
  const filteredTargets = useMemo(() => {
    const keyword = normalizeAiLabel(query);
    if (keyword) {
      return AI_PRACTICE_TARGETS.filter((target) => {
        const haystack = [
          target.display,
          target.gloss,
          target.region,
          target.label,
          ...(target.aliases || []),
        ].map(normalizeAiLabel);
        return haystack.some((value) => value.includes(keyword));
      });
    }
    if (activeCategory === "recommended") {
      return AI_PRACTICE_TARGETS.filter((target) => target.featured);
    }
    return AI_PRACTICE_TARGETS.filter((target) => target.category === activeCategory);
  }, [activeCategory, query]);

  const visibleTargets = useMemo(() => {
    if (query.trim()) return filteredTargets.slice(0, 8);
    return expanded ? filteredTargets : filteredTargets.slice(0, 6);
  }, [expanded, filteredTargets, query]);

  const selectTarget = (target: AiPracticeTarget) => {
    setTargetIndex(findTargetIndex(target));
  };

  const cycleTarget = () => {
    const pool = filteredTargets.length > 0 ? filteredTargets : AI_PRACTICE_TARGETS;
    const currentPosition = pool.findIndex((target) => target.label === current.label);
    const next = pool[(currentPosition + 1 + pool.length) % pool.length];
    selectTarget(next);
  };

  if (!isProUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-[22px] bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mb-6 text-amber-500 shadow-sm shadow-amber-500/5">
          <Crown className="w-8 h-8 animate-pulse text-amber-500" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-3">Tính năng dành cho gói Pro</h2>
        <p className="text-muted-foreground font-body max-w-md mb-8 leading-relaxed">
          Luyện tập nhận diện tự do qua camera AI là tính năng cao cấp thuộc gói Pro. Vui lòng nâng cấp gói Pro để bắt đầu luyện tập không giới hạn.
        </p>
        <button
          onClick={() => setPremiumOpen(true)}
          className="btn-primary-gradient px-8 py-3.5 rounded-full font-body font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
        >
          Nâng cấp Pro ngay
        </button>
        <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full min-w-0">
      <div className="hero-panel p-4 md:p-7 flex items-start md:items-center gap-3 md:gap-4 mb-5 md:mb-6">
        <div className="icon-tile !h-12 !w-12 shrink-0 md:!h-14 md:!w-14" style={{ background: "var(--gradient-primary)" }}>
          <Cpu className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-extrabold text-2xl md:text-4xl text-white leading-tight">
            Nhận diện AI
          </h2>
          <p className="font-body text-sm md:text-base text-white/85">
            Chọn một ký hiệu, thực hiện trước camera và để AI kiểm tra kết quả.
          </p>
        </div>
      </div>

      <div className="card-pop p-4 md:p-5 mb-5 md:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">
              Chọn ký hiệu luyện tập
            </p>
            <h3 className="font-display font-extrabold text-xl md:text-2xl text-foreground">
              Gợi ý theo chủ đề
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              {query.trim() ? "Kết quả tìm kiếm được rút gọn để dễ chọn." : categoryInfo.description}
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setExpanded(false);
              }}
              placeholder="Tìm ký hiệu..."
              className="app-search w-full pl-10 pr-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {AI_PRACTICE_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const active = activeCategory === category.id && !query.trim();
            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setQuery("");
                  setExpanded(false);
                }}
                className={`shrink-0 inline-flex items-center gap-2 font-body transition-all ${
                  active ? "chip-active" : "chip-soft text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTargets.map((target) => {
            const selected = target.label === current.label;
            const Icon = CATEGORY_ICONS[target.category];
            return (
              <button
                key={target.label}
                onClick={() => selectTarget(target)}
                className={`rounded-[20px] border p-3 text-left transition-all md:p-4 ${
                  selected
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                  }`}>
                    {selected ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-extrabold text-base text-foreground leading-tight">
                      {target.display}
                    </p>
                    <p className="text-xs text-muted-foreground font-body mt-1">
                      {targetMeta(target)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!query.trim() && filteredTargets.length > 6 && (
          <button
            onClick={() => setExpanded((value) => !value)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-body font-semibold text-primary hover:underline"
          >
            {expanded ? "Thu gọn danh sách" : `Xem thêm ${filteredTargets.length - 6} ký hiệu`}
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        )}

        {query.trim() && visibleTargets.length === 0 && (
          <div className="rounded-[22px] border border-dashed border-border bg-muted/40 p-5 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-body text-muted-foreground">
              Chưa có ký hiệu phù hợp. Hãy thử từ khóa ngắn hơn.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] md:gap-6 mb-6">
        <div className="card-pop p-4 md:p-6 min-h-[240px] md:min-h-[320px]">
          <div>
            <p className="text-xs font-body text-muted-foreground mb-3 uppercase tracking-wide">
              Bài đang luyện
            </p>
            <div className="coral-box w-full mb-4 text-2xl md:text-3xl">{current.display}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="chip-soft text-muted-foreground">{targetMeta(current)}</span>
              <span className="chip-soft text-muted-foreground">{current.gloss}</span>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              Đưa tay vào khung hình và thực hiện ký hiệu “{current.display}”. Nếu ký hiệu có vùng miền,
              hãy luyện đúng biến thể đang chọn.
            </p>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-display text-base font-extrabold text-foreground">Video mẫu</p>
              {sampleEntry?.word && (
                <span className="max-w-[55%] truncate rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  {sampleEntry.word}
                </span>
              )}
            </div>

            {sampleLoading ? (
              <div className="aspect-video w-full rounded-[22px] border border-border bg-muted/45 flex items-center justify-center text-sm text-muted-foreground">
                Đang tải video mẫu...
              </div>
            ) : sampleEntry?.videoUrl ? (
              <VideoPlayer
                src={sampleEntry.videoUrl}
                label={`Video mẫu: ${sampleEntry.word || current.display}`}
                className="aspect-video w-full rounded-[22px] overflow-hidden bg-black shadow-xl ring-1 ring-border/80"
                videoClassName="w-full h-full object-contain"
                autoPlay
                loop
                muted
                controls
                preload="metadata"
              />
            ) : (
              <div className="aspect-video w-full rounded-[22px] border border-dashed border-border bg-muted/45 flex flex-col items-center justify-center gap-2 px-5 text-center text-muted-foreground">
                <Video className="h-8 w-8 text-primary" />
                <p className="font-display font-bold text-foreground">Chưa có video mẫu</p>
                <p className="text-xs font-body">Bạn vẫn có thể luyện trực tiếp bằng camera ở khung bên phải.</p>
              </div>
            )}
          </div>

          <button
            onClick={cycleTarget}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-[18px] border border-border bg-card px-4 py-3 text-sm font-body font-bold text-foreground hover:bg-muted transition-colors"
          >
            <Shuffle className="w-4 h-4 text-primary" />
            Đổi bài luyện tập
          </button>
        </div>

        <AiCameraPractice
          key={current.label}
          question={`Thực hiện ký hiệu “${current.display}” trước camera`}
          targetLabel={current.label}
          targetDisplay={current.display}
          practiceItemId={current.practiceItemId}
          minConfidence={0.7}
        />
      </div>
    </div>
  );
}
