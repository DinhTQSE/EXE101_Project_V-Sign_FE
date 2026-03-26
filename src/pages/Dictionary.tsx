import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, X } from "lucide-react";

interface DictionaryEntry {
  id: number;
  word: string;
  emoji: string;
  category: string;
  description: string;
  videoSrc?: string;
}

const dictionaryData: DictionaryEntry[] = [
  // VSL chính thức (video local)
  { id: 1, word: "Địa chỉ", emoji: "📍", category: "Giao tiếp", description: "Ký hiệu chỉ địa chỉ, nơi ở", videoSrc: "/videos/dia-chi.mp4" },
  { id: 2, word: "Tiếp tân", emoji: "🤝", category: "Giao tiếp", description: "Người đón khách, lễ tân", videoSrc: "/videos/tiep-tan.mp4" },
  { id: 3, word: "Thói quen", emoji: "🔄", category: "Sinh hoạt", description: "Hành động lặp đi lặp lại hàng ngày", videoSrc: "/videos/thoi-quen.mp4" },
  { id: 4, word: "Không nên", emoji: "🚫", category: "Giao tiếp", description: "Điều không nên làm, cấm", videoSrc: "/videos/khong-nen.mp4" },
  { id: 5, word: "Ngày giải phóng Miền Nam 30/4", emoji: "🇻🇳", category: "Lịch sử", description: "Ngày lễ kỷ niệm giải phóng miền Nam Việt Nam", videoSrc: "/videos/ngay-giai-phong.mp4" },
  // Từ vựng cơ bản (có video local)
  { id: 6, word: "Xin chào", emoji: "👋", category: "Chào hỏi", description: "Lời chào cơ bản trong giao tiếp hàng ngày", videoSrc: "/videos/xin-chao.mp4" },
  { id: 7, word: "Cảm ơn", emoji: "🙏", category: "Chào hỏi", description: "Bày tỏ lòng biết ơn" },
  { id: 8, word: "Xin lỗi", emoji: "🙇", category: "Chào hỏi", description: "Xin lỗi, bày tỏ sự hối tiếc" },
  { id: 9, word: "Tạm biệt", emoji: "👋", category: "Chào hỏi", description: "Lời chào khi chia tay", videoSrc: "/videos/tam-biet.mp4" },
  { id: 10, word: "Vâng", emoji: "👍", category: "Giao tiếp", description: "Đồng ý, xác nhận" },
  { id: 11, word: "Không", emoji: "🙅", category: "Giao tiếp", description: "Từ chối, phủ định" },
  { id: 12, word: "Gia đình", emoji: "👨‍👩‍👧‍👦", category: "Gia đình", description: "Chỉ gia đình, người thân" },
  { id: 13, word: "Bố", emoji: "👨", category: "Gia đình", description: "Cha, ba, bố" },
  { id: 14, word: "Mẹ", emoji: "👩", category: "Gia đình", description: "Mẹ, má" },
  { id: 15, word: "Anh/Chị", emoji: "🧑", category: "Gia đình", description: "Anh trai hoặc chị gái" },
  { id: 16, word: "Yêu", emoji: "❤️", category: "Cảm xúc", description: "Tình yêu, yêu thương" },
  { id: 17, word: "Vui", emoji: "😊", category: "Cảm xúc", description: "Vui vẻ, hạnh phúc" },
  { id: 18, word: "Buồn", emoji: "😢", category: "Cảm xúc", description: "Buồn bã, tâm trạng không tốt" },
  { id: 19, word: "Giận", emoji: "😠", category: "Cảm xúc", description: "Tức giận, bực bội" },
  { id: 20, word: "Trường học", emoji: "🏫", category: "Học tập", description: "Trường, nơi học tập" },
  { id: 21, word: "Thầy giáo", emoji: "👨‍🏫", category: "Học tập", description: "Giáo viên nam" },
  { id: 22, word: "Cô giáo", emoji: "👩‍🏫", category: "Học tập", description: "Giáo viên nữ" },
  { id: 23, word: "Bạn bè", emoji: "🤝", category: "Giao tiếp", description: "Bạn, bạn bè" },
  { id: 24, word: "Ăn", emoji: "🍽️", category: "Sinh hoạt", description: "Ăn uống, ăn cơm" },
  { id: 25, word: "Uống", emoji: "🥤", category: "Sinh hoạt", description: "Uống nước, uống" },
  { id: 26, word: "Ngủ", emoji: "😴", category: "Sinh hoạt", description: "Ngủ, đi ngủ" },
  { id: 27, word: "Đi", emoji: "🚶", category: "Sinh hoạt", description: "Di chuyển, đi đâu đó" },
  { id: 28, word: "Giúp đỡ", emoji: "🤲", category: "Giao tiếp", description: "Nhờ giúp đỡ, hỗ trợ" },
  { id: 29, word: "Nước", emoji: "💧", category: "Sinh hoạt", description: "Nước uống" },
];

const categories = [...new Set(dictionaryData.map(d => d.category))];

export default function Dictionary() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<DictionaryEntry | null>(null);

  const results = useMemo(() => {
    let filtered = dictionaryData;
    if (selectedCategory) filtered = filtered.filter(d => d.category === selectedCategory);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(d => d.word.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    return filtered;
  }, [query, selectedCategory]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-foreground mb-1">Từ điển VSL</h1>
        <p className="font-body text-sm text-muted-foreground">Tra cứu ký hiệu ngôn ngữ ký hiệu Việt Nam</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Nhập từ khóa cần tra (VD: Cảm ơn, Xin lỗi)..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-input bg-card text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-4 py-2 rounded-full font-body text-xs font-semibold transition-all ${
            !selectedCategory ? "text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          style={!selectedCategory ? { background: "var(--gradient-primary)" } : undefined}
        >
          Tất cả
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`shrink-0 px-4 py-2 rounded-full font-body text-xs font-semibold transition-all ${
              selectedCategory === cat ? "text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            style={selectedCategory === cat ? { background: "var(--gradient-primary)" } : undefined}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <AnimatePresence mode="popLayout">
        {results.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-body text-muted-foreground">Không tìm thấy kết quả cho "{query}"</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((entry, i) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                className="card-pastel p-4 flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => entry.videoSrc && setActiveVideo(entry)}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-3xl group-hover:scale-110 transition-transform">
                  {entry.emoji}
                </div>
                <h3 className="font-display font-bold text-foreground text-sm mb-1">{entry.word}</h3>
                <p className="text-[11px] text-muted-foreground font-body line-clamp-2 mb-2">{entry.description}</p>
                <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-body">{entry.category}</span>
                {entry.videoSrc ? (
                  <button className="mt-3 flex items-center gap-1 text-[11px] text-primary font-body font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3 h-3" /> Xem ký hiệu
                  </button>
                ) : (
                  <span className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground font-body opacity-0 group-hover:opacity-100 transition-opacity">
                    Sắp có video
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.25 }}
              className="bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeVideo.emoji}</span>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{activeVideo.word}</h3>
                    <p className="text-xs text-muted-foreground font-body">{activeVideo.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4">
                <video
                  key={activeVideo.videoSrc}
                  src={activeVideo.videoSrc}
                  controls
                  autoPlay
                  playsInline
                  className="w-full rounded-2xl bg-muted"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
