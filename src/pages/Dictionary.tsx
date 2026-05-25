import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Dumbbell, Loader2, Play, RotateCcw, Search, X, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dictionaryApi, DictionaryEntryDto } from "@/services/vsignApi";

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

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await dictionaryApi.listEntries({ size: 100 }));
    } catch {
      setError("Không thể tải từ điển từ backend. Hãy kiểm tra Spring Boot đang chạy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEntries();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.category).filter(Boolean))).sort(),
    [entries]
  );

  const difficulties = useMemo(
    () => Array.from(new Set(entries.map(difficultyLabel).filter(Boolean))).sort(),
    [entries]
  );

  const results = useMemo(() => {
    let filtered = entries;
    if (selectedCategory) filtered = filtered.filter((entry) => entry.category === selectedCategory);
    if (selectedDifficulty) filtered = filtered.filter((entry) => difficultyLabel(entry) === selectedDifficulty);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter((entry) =>
        entry.word.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [entries, query, selectedCategory, selectedDifficulty]);

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
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
        )}
        <div className="flex items-center gap-4">
          <div className="icon-tile shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white leading-tight">Từ điển Ngôn ngữ Ký hiệu</h1>
            <p className="font-body text-sm md:text-base text-white/85">
              Tra cứu và luyện tập ký hiệu Việt Nam{publicMode ? " · Không cần đăng nhập" : ""}.
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card-pop p-4 text-center">
            <p className="font-display font-extrabold text-2xl text-foreground">{entries.length}</p>
            <p className="text-xs text-muted-foreground font-body">Tổng số từ</p>
          </div>
          <div className="card-pop p-4 text-center">
            <p className="font-display font-extrabold text-2xl text-foreground">—</p>
            <p className="text-xs text-muted-foreground font-body">Đã học</p>
          </div>
          <div className="card-pop p-4 text-center">
            <p className="font-display font-extrabold text-2xl text-foreground">—</p>
            <p className="text-xs text-muted-foreground font-body">Đang ôn tập</p>
          </div>
          <div className="card-pop p-4 text-center">
            <p className="font-display font-extrabold text-2xl text-foreground">—</p>
            <p className="text-xs text-muted-foreground font-body">Đã thành thạo</p>
          </div>
        </div>
      )}

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nhập từ khóa cần tra..."
          className="w-full pl-12 pr-4 py-4 rounded-[20px] border border-input bg-card/85 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 font-body transition-all ${
            !selectedCategory ? "chip-active" : "chip-soft text-muted-foreground hover:text-foreground"
          }`}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
            className={`shrink-0 font-body transition-all ${
              selectedCategory === category ? "chip-active" : "chip-soft text-muted-foreground hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

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
              selectedDifficulty === level ? "chip-active" : "chip-soft text-muted-foreground hover:text-foreground"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">Đang tải từ điển...</p>
        </div>
      ) : error ? (
        <div className="card-pastel p-6 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground mb-5">{error}</p>
          <button onClick={() => void loadEntries()} className="btn-primary-gradient inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Tải lại
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {results.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-muted-foreground">Không tìm thấy kết quả cho "{query}"</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((entry, index) => (
                <motion.button
                  key={entry.entryId || entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="card-pop p-4 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-1 transition-all"
                  onClick={() => setActiveEntry(entry)}
                >
                  <div className="icon-tile bg-primary/10 mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display font-extrabold text-foreground text-base mb-1">{entry.word}</h3>
                  <p className="text-[11px] text-muted-foreground font-body line-clamp-2 mb-2">{entry.description}</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-body">{entry.category}</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body">{difficultyLabel(entry)}</span>
                  </div>
                  <span className="mt-3 flex items-center gap-1 text-[11px] text-primary font-body font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3 h-3" /> Xem chi tiết
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

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
              className="bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-display font-bold text-foreground">{activeEntry.word}</h3>
                    <p className="text-xs text-muted-foreground font-body">{activeEntry.description}</p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-body">{activeEntry.category}</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body">{difficultyLabel(activeEntry)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setActiveEntry(null)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4">
                {activeEntry.videoUrl ? (
                  <video
                    key={activeEntry.videoUrl}
                    src={activeEntry.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full rounded-2xl bg-muted"
                  />
                ) : (
                  <div className="rounded-2xl bg-muted p-8 text-center text-sm text-muted-foreground">
                    Video minh họa chưa được gắn URL từ backend.
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
