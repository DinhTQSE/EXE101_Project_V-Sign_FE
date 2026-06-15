import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Play,
  RotateCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dictionaryApi, DictionaryEntryDto } from "@/services/vsignApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import VideoPlayer from "@/components/VideoPlayer";

const PAGE_SIZE = 20;

function difficultyLabel(entry: DictionaryEntryDto) {
  if (entry.difficulty) return entry.difficulty;
  if (entry.difficultyLevel >= 3) return "Nâng cao";
  if (entry.difficultyLevel === 2) return "Trung bình";
  return "Cơ bản";
}

export default function Dictionary({ publicMode = false }: { publicMode?: boolean }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [entries, setEntries] = useState<DictionaryEntryDto[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<DictionaryEntryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await dictionaryApi.listEntries({ size: 100 }));
    } catch {
      setError("Không thể tải từ điển. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEntries();
  }, []);

  // Reset to page 0 when search/filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [query, selectedCategory, selectedDifficulty]);

  const categories = useMemo(
    () => Array.from(new Set(entries.map((e) => e.category).filter(Boolean))).sort(),
    [entries]
  );

  const difficulties = useMemo(
    () => Array.from(new Set(entries.map(difficultyLabel).filter(Boolean))).sort(),
    [entries]
  );

  const results = useMemo(() => {
    let filtered = entries;
    if (selectedCategory) filtered = filtered.filter((e) => e.category === selectedCategory);
    if (selectedDifficulty) filtered = filtered.filter((e) => difficultyLabel(e) === selectedDifficulty);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.word.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [entries, query, selectedCategory, selectedDifficulty]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pageItems = results.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handlePractice = (entry: DictionaryEntryDto) => {
    if (!isLoggedIn) {
      navigate("/", { state: { authMode: "login", redirectReason: "dictionary-practice" } });
      return;
    }
    navigate("/ai-recognition", { state: { practiceSign: entry.word } });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero header */}
      <div className="hero-panel p-5 md:p-7 mb-6">
        {publicMode && (
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
        )}
        <div className="flex items-center gap-4">
          <div className="icon-tile shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white leading-tight">
              Từ điển Ngôn ngữ Ký hiệu
            </h1>
            <p className="font-body text-sm md:text-base text-white/85">
              Tra cứu và luyện tập ký hiệu Việt Nam
              {publicMode ? " · Không cần đăng nhập" : ""}.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card-pop p-4 text-center">
            <p className="font-display font-extrabold text-2xl text-foreground">{entries.length}</p>
            <p className="text-xs text-muted-foreground font-body">Tổng số từ</p>
          </div>
          <div className="card-pop p-4 text-center">
            <p className="font-display font-extrabold text-2xl text-foreground">
              {entries.filter((e) => e.videoUrl).length}
            </p>
            <p className="text-xs text-muted-foreground font-body">Có video</p>
          </div>
          <div className="card-pop p-4 text-center">
            <p className="font-display font-extrabold text-2xl text-foreground">{categories.length}</p>
            <p className="text-xs text-muted-foreground font-body">Chủ đề</p>
          </div>
          <div className="card-pop p-4 text-center">
            <p className="font-display font-extrabold text-2xl text-foreground">{results.length}</p>
            <p className="text-xs text-muted-foreground font-body">Kết quả</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ khóa cần tra..."
          className="w-full pl-12 pr-4 py-4 rounded-[20px] border border-input bg-card/85 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 font-body transition-all ${
            !selectedCategory ? "chip-active" : "chip-soft text-muted-foreground hover:text-foreground"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`shrink-0 font-body transition-all ${
              selectedCategory === cat
                ? "chip-active"
                : "chip-soft text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Difficulty chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedDifficulty(null)}
          className={`shrink-0 font-body transition-all ${
            !selectedDifficulty ? "chip-active" : "chip-soft text-muted-foreground hover:text-foreground"
          }`}
        >
          Mọi độ khó
        </button>
        {difficulties.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedDifficulty(level === selectedDifficulty ? null : level)}
            className={`shrink-0 font-body transition-all ${
              selectedDifficulty === level
                ? "chip-active"
                : "chip-soft text-muted-foreground hover:text-foreground"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Đang tải từ điển..." />
        </div>
      ) : error ? (
        <div className="card-pastel p-6 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground mb-5">{error}</p>
          <button
            onClick={() => void loadEntries()}
            className="btn-primary-gradient inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Tải lại
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-muted-foreground">
            Không tìm thấy kết quả{query ? ` cho "${query}"` : ""}
          </p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pageItems.map((entry, index) => (
                <motion.button
                  key={entry.entryId || entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, delay: index * 0.015 }}
                  className="card-pop flex flex-col text-left group cursor-pointer hover:-translate-y-1 transition-all overflow-hidden"
                  onClick={() => setActiveEntry(entry)}
                >
                  {/* Thumbnail or icon */}
                  {entry.thumbnailUrl ? (
                    <img
                      src={entry.thumbnailUrl}
                      alt={entry.word}
                      loading="lazy"
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <div className="w-full h-28 bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                      <BookOpen className="w-10 h-10 text-primary/40 group-hover:text-primary/60 group-hover:scale-110 transition-all" />
                    </div>
                  )}

                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-display font-extrabold text-foreground text-sm mb-0.5 truncate">
                      {entry.word}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-body line-clamp-2 mb-2 flex-1">
                      {entry.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-body">
                        {entry.category}
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body">
                        {difficultyLabel(entry)}
                      </span>
                      {entry.videoUrl && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-body flex items-center gap-0.5">
                          <Play className="w-2.5 h-2.5" /> Video
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-body font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i).map((i) => {
                  const isActive = i === safePage;
                  const isNear = Math.abs(i - safePage) <= 1 || i === 0 || i === totalPages - 1;
                  if (!isNear) {
                    if (i === 1 && safePage > 2) return <span key={i} className="text-muted-foreground text-sm px-1">…</span>;
                    if (i === totalPages - 2 && safePage < totalPages - 3) return <span key={i} className="text-muted-foreground text-sm px-1">…</span>;
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-body font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Tiếp <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground font-body mt-3">
            Trang {safePage + 1} / {totalPages} · {results.length} từ vựng
          </p>
        </>
      )}

      {/* Word detail modal — video lazy loaded on open */}
      <AnimatePresence>
        {activeEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveEntry(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.25 }}
              className="bg-card rounded-[32px] shadow-2xl w-[min(640px,94vw)] max-h-[92vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between gap-4 p-4 md:p-5 border-b border-border shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="icon-tile shrink-0" style={{ background: "var(--gradient-primary)" }}>
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-foreground text-lg md:text-xl truncate">
                      {activeEntry.word}
                    </h3>
                    <p className="text-xs text-muted-foreground font-body line-clamp-1">
                      {activeEntry.description}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-body">
                        {activeEntry.category}
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body">
                        {difficultyLabel(activeEntry)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveEntry(null)}
                  className="p-2 rounded-xl hover:bg-muted transition-colors shrink-0"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Modal body — video only loaded when modal opens */}
              <div className="p-4 md:p-6 overflow-y-auto">
                {activeEntry.videoUrl ? (
                  <VideoPlayer
                    src={activeEntry.videoUrl}
                    className="aspect-video w-full rounded-[20px] bg-black overflow-hidden shadow-xl"
                    autoPlay
                    preload="auto"
                    label={activeEntry.word}
                  />
                ) : (
                  <div className="aspect-video w-full rounded-[20px] bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Play className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-body">Chưa có video minh họa</p>
                  </div>
                )}

                <button
                  onClick={() => handlePractice(activeEntry)}
                  className="btn-primary-gradient w-full mt-4 flex items-center justify-center gap-2"
                >
                  <Dumbbell className="w-4 h-4" /> Luyện tập ngay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
