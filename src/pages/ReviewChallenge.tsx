import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Zap, Puzzle, CheckCircle, XCircle, ChevronRight,
  Trophy, Star, Clock, ArrowRight, Shuffle, Eye, EyeOff,
} from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/contexts/AuthContext";

/* ═══════════════════════════════════════════════
   SHARED DATA — words to review
   ═══════════════════════════════════════════════ */

interface ReviewWord {
  id: number;
  word: string;
  emoji: string;
  hint: string;
  category: string;
}

const reviewWords: ReviewWord[] = [
  { id: 1, word: "Xin chào", emoji: "👋", hint: "Vẫy tay chào", category: "Chào hỏi" },
  { id: 2, word: "Tạm biệt", emoji: "👋", hint: "Vẫy tay từ xa", category: "Chào hỏi" },
  { id: 3, word: "Cảm ơn", emoji: "🙏", hint: "Hai tay chắp lại", category: "Chào hỏi" },
  { id: 4, word: "Xin lỗi", emoji: "🙇", hint: "Cúi đầu xin lỗi", category: "Chào hỏi" },
  { id: 5, word: "Bố", emoji: "👨", hint: "Chạm trán", category: "Gia đình" },
  { id: 6, word: "Mẹ", emoji: "👩", hint: "Chạm cằm", category: "Gia đình" },
  { id: 7, word: "Anh/Chị", emoji: "👫", hint: "Người lớn hơn mình", category: "Gia đình" },
  { id: 8, word: "Ông", emoji: "👴", hint: "Người lớn tuổi nhất", category: "Gia đình" },
  { id: 9, word: "Bà", emoji: "👵", hint: "Người phụ nữ lớn tuổi", category: "Gia đình" },
  { id: 10, word: "Cơm", emoji: "🍚", hint: "Món ăn chính", category: "Đồ ăn" },
  { id: 11, word: "Nước", emoji: "💧", hint: "Uống mỗi ngày", category: "Đồ ăn" },
  { id: 12, word: "Cà phê", emoji: "☕", hint: "Uống buổi sáng", category: "Đồ ăn" },
  { id: 13, word: "Vui", emoji: "😊", hint: "Cảm xúc tích cực", category: "Cảm xúc" },
  { id: 14, word: "Buồn", emoji: "😢", hint: "Cảm xúc tiêu cực", category: "Cảm xúc" },
  { id: 15, word: "Giận", emoji: "😠", hint: "Cảm xúc mạnh mẽ", category: "Cảm xúc" },
  { id: 16, word: "Đi học", emoji: "🏫", hint: "Hoạt động buổi sáng", category: "Hoạt động" },
  { id: 17, word: "Ngủ", emoji: "😴", hint: "Nhắm mắt, tay áp má", category: "Hoạt động" },
  { id: 18, word: "Ăn", emoji: "🍽️", hint: "Đưa tay lên miệng", category: "Hoạt động" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══════════════════════════════════════════════
   MODE 1: FLASHCARDS — lật thẻ ôn tập
   ═══════════════════════════════════════════════ */

function FlashcardMode() {
  const [cards] = useState(() => shuffle(reviewWords));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [done, setDone] = useState(false);

  const card = cards[idx];

  const handleNext = (isKnown: boolean) => {
    if (isKnown) setKnown(k => k + 1);
    else setUnknown(u => u + 1);
    setFlipped(false);
    if (idx >= cards.length - 1) {
      setDone(true);
    } else {
      setTimeout(() => setIdx(i => i + 1), 200);
    }
  };

  const handleReset = () => {
    setIdx(0); setFlipped(false); setKnown(0); setUnknown(0); setDone(false);
  };

  if (done) {
    const total = known + unknown;
    const pct = Math.round((known / total) * 100);
    return (
      <div className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
          {pct >= 80 ? "🌟" : pct >= 50 ? "👍" : "💪"}
        </motion.div>
        <h3 className="font-display font-bold text-xl text-foreground mb-2">Kết quả ôn tập</h3>
        <p className="text-muted-foreground font-body mb-6">
          Nhớ <span className="text-primary font-bold">{known}</span> / {total} từ ({pct}%)
        </p>
        <div className="flex gap-4 justify-center text-sm font-body mb-6">
          <span className="flex items-center gap-1.5 text-[hsl(var(--success))]">
            <CheckCircle className="w-4 h-4" /> Đã nhớ: {known}
          </span>
          <span className="flex items-center gap-1.5 text-destructive">
            <XCircle className="w-4 h-4" /> Chưa nhớ: {unknown}
          </span>
        </div>
        <button onClick={handleReset} className="btn-primary-gradient flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Ôn lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-body">{idx + 1} / {cards.length}</span>
        <div className="flex gap-3 text-xs font-body">
          <span className="text-[hsl(var(--success))]">✓ {known}</span>
          <span className="text-destructive">✗ {unknown}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-6">
        <div className="h-full rounded-full transition-all" style={{ width: `${((idx) / cards.length) * 100}%`, background: "var(--gradient-primary)" }} />
      </div>

      <motion.div
        key={idx}
        initial={{ opacity: 0, rotateY: -90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        className="card-pastel p-8 text-center cursor-pointer min-h-[250px] flex flex-col items-center justify-center"
        onClick={() => setFlipped(!flipped)}
      >
        {!flipped ? (
          <>
            <span className="text-7xl mb-4">{card.emoji}</span>
            <p className="text-muted-foreground font-body text-sm flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Nhấn để xem đáp án
            </p>
          </>
        ) : (
          <>
            <span className="text-5xl mb-3">{card.emoji}</span>
            <h3 className="font-display font-bold text-2xl text-foreground mb-2">{card.word}</h3>
            <p className="text-muted-foreground font-body text-sm">{card.hint}</p>
            <span className="mt-2 text-[10px] bg-primary/15 text-primary px-2.5 py-1 rounded-full font-body">{card.category}</span>
          </>
        )}
      </motion.div>

      {flipped && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mt-6">
          <button onClick={() => handleNext(false)}
            className="flex-1 py-3 rounded-2xl border border-destructive/30 text-destructive font-body font-semibold hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4" /> Chưa nhớ
          </button>
          <button onClick={() => handleNext(true)}
            className="flex-1 btn-primary-gradient flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Đã nhớ
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MODE 2: SPEED QUIZ — trắc nghiệm nhanh
   ═══════════════════════════════════════════════ */

function SpeedQuizMode() {
  const [questions] = useState(() => {
    const shuffled = shuffle(reviewWords);
    return shuffled.slice(0, 10).map(w => {
      const wrongChoices = shuffle(reviewWords.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.word);
      const options = shuffle([w.word, ...wrongChoices]);
      return { ...w, options, correctIdx: options.indexOf(w.word) };
    });
  });
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    if (done) return;
    if (timeLeft <= 0) { goNext(false); return; }
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, done]);

  const goNext = useCallback((correct: boolean) => {
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => { const n = s + 1; setBestStreak(b => Math.max(b, n)); return n; });
    } else {
      setStreak(0);
    }
    if (qIdx >= questions.length - 1) { setDone(true); return; }
    setTimeout(() => { setQIdx(i => i + 1); setSelected(null); setTimeLeft(10); }, 800);
  }, [qIdx, questions.length]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    goNext(idx === questions[qIdx].correctIdx);
  };

  const handleReset = () => {
    setQIdx(0); setScore(0); setSelected(null); setTimeLeft(10); setDone(false); setStreak(0); setBestStreak(0);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
          {pct >= 80 ? "⚡" : pct >= 50 ? "🔥" : "💪"}
        </motion.div>
        <h3 className="font-display font-bold text-xl text-foreground mb-2">Kết quả Speed Quiz</h3>
        <p className="text-muted-foreground font-body mb-2">
          Điểm: <span className="text-primary font-bold">{score}/{questions.length}</span> ({pct}%)
        </p>
        <p className="text-muted-foreground font-body text-sm mb-6">
          Chuỗi dài nhất: <span className="text-amber-500 font-bold">{bestStreak}</span> 🔥
        </p>
        <button onClick={handleReset} className="btn-primary-gradient flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Chơi lại
        </button>
      </div>
    );
  }

  const q = questions[qIdx];
  const isUrgent = timeLeft <= 3;

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isUrgent ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className={`font-display font-bold ${isUrgent ? "text-destructive" : "text-foreground"}`}>{timeLeft}s</span>
        </div>
        <span className="text-sm text-muted-foreground font-body">{qIdx + 1}/{questions.length}</span>
        <div className="flex items-center gap-1 text-amber-500 text-sm font-body font-bold">
          {streak > 0 && <><Zap className="w-4 h-4" /> {streak}</>}
        </div>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-6">
        <div className="h-full rounded-full transition-all" style={{ width: `${(timeLeft / 10) * 100}%`, background: isUrgent ? "hsl(var(--destructive))" : "var(--gradient-primary)" }} />
      </div>

      <div className="card-pastel p-8 text-center mb-6">
        <span className="text-6xl block mb-3">{q.emoji}</span>
        <p className="text-muted-foreground font-body text-sm">{q.hint}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIdx;
          const isSelected = selected === i;
          return (
            <button key={i} onClick={() => handleSelect(i)}
              className={`card-pastel p-4 font-body font-semibold text-sm text-foreground transition-all ${
                selected !== null && isCorrect ? "border-2 border-[hsl(var(--success))] bg-[hsl(var(--success))]/10"
                : isSelected && !isCorrect ? "border-2 border-destructive bg-destructive/10"
                : selected === null ? "hover:border-primary hover:border-2" : ""
              }`}
            >{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MODE 3: MATCHING — nối từ với emoji
   ═══════════════════════════════════════════════ */

interface MatchItem {
  id: number;
  content: string;
  type: "word" | "emoji";
  pairId: number;
}

function MatchingMode() {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const words = shuffle(reviewWords).slice(0, 6);
    const wordItems: MatchItem[] = words.map((w, i) => ({ id: i * 2, content: w.word, type: "word", pairId: w.id }));
    const emojiItems: MatchItem[] = words.map((w, i) => ({ id: i * 2 + 1, content: w.emoji, type: "emoji", pairId: w.id }));
    setItems(shuffle([...wordItems, ...emojiItems]));
  }, []);

  const handleSelect = (item: MatchItem) => {
    if (matched.has(item.pairId)) return;
    if (selected === null) {
      setSelected(item.id);
      return;
    }
    const prev = items.find(i => i.id === selected)!;
    if (prev.id === item.id) { setSelected(null); return; }

    setMoves(m => m + 1);
    if (prev.pairId === item.pairId && prev.type !== item.type) {
      setMatched(s => new Set([...s, item.pairId]));
      setSelected(null);
      if (matched.size + 1 === items.length / 2) setDone(true);
    } else {
      setWrong(item.id);
      setTimeout(() => { setSelected(null); setWrong(null); }, 600);
    }
  };

  const handleReset = () => {
    const words = shuffle(reviewWords).slice(0, 6);
    const wordItems: MatchItem[] = words.map((w, i) => ({ id: i * 2, content: w.word, type: "word", pairId: w.id }));
    const emojiItems: MatchItem[] = words.map((w, i) => ({ id: i * 2 + 1, content: w.emoji, type: "emoji", pairId: w.id }));
    setItems(shuffle([...wordItems, ...emojiItems]));
    setSelected(null); setMatched(new Set()); setWrong(null); setMoves(0); setDone(false);
  };

  if (done) {
    return (
      <div className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🧩</motion.div>
        <h3 className="font-display font-bold text-xl text-foreground mb-2">Hoàn thành!</h3>
        <p className="text-muted-foreground font-body mb-6">
          Bạn đã nối đúng tất cả trong <span className="text-primary font-bold">{moves}</span> lượt
        </p>
        <button onClick={handleReset} className="btn-primary-gradient flex items-center gap-2 mx-auto">
          <Shuffle className="w-4 h-4" /> Chơi lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-body">Nối từ với biểu tượng</span>
        <span className="text-sm text-muted-foreground font-body">Lượt: {moves}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map(item => {
          const isMatched = matched.has(item.pairId);
          const isSelected = selected === item.id;
          const isWrong = wrong === item.id || (wrong !== null && selected === item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              disabled={isMatched}
              className={`card-pastel p-4 text-center transition-all min-h-[70px] flex items-center justify-center ${
                isMatched ? "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))] border-2 opacity-60"
                : isWrong ? "border-2 border-destructive bg-destructive/10 animate-shake"
                : isSelected ? "border-2 border-primary bg-primary/10 shadow-md"
                : "hover:border-primary hover:border-2"
              }`}
            >
              {item.type === "emoji" ? (
                <span className="text-3xl">{item.content}</span>
              ) : (
                <span className="font-body font-semibold text-foreground text-sm">{item.content}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN: Review & Challenge Hub
   ═══════════════════════════════════════════════ */

const modes = [
  { id: "flashcard", label: "Lật thẻ ôn tập", icon: RotateCcw, emoji: "🃏", desc: "Ôn lại từ vựng qua thẻ ghi nhớ" },
  { id: "speed-quiz", label: "Trắc nghiệm nhanh", icon: Zap, emoji: "⚡", desc: "Trả lời nhanh trong 10 giây" },
  { id: "matching", label: "Nối từ", icon: Puzzle, emoji: "🧩", desc: "Ghép từ với ký hiệu tương ứng" },
] as const;

type ModeId = (typeof modes)[number]["id"];

export default function ReviewChallenge() {
  const { userName, layoutMode } = useAuth();
  const [activeMode, setActiveMode] = useState<ModeId | null>(null);
  const isChildMode = layoutMode === "child";

  if (activeMode) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setActiveMode(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-foreground transition-colors mb-6">
          ← Quay lại
        </button>
        <h2 className="font-display font-bold text-xl text-foreground text-center mb-6">
          {modes.find(m => m.id === activeMode)?.label}
        </h2>
        <AnimatePresence mode="wait">
          <motion.div key={activeMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeMode === "flashcard" && <FlashcardMode />}
            {activeMode === "speed-quiz" && <SpeedQuizMode />}
            {activeMode === "matching" && <MatchingMode />}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Mascot */}
      <div className="flex items-start gap-4 mb-8">
        <motion.img src={mascotImg} alt="Mascot"
          className={`object-contain drop-shadow-lg shrink-0 ${isChildMode ? "w-24 h-24" : "w-20 h-20"}`}
          animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <div className="speech-bubble flex-1">
          <p className={`font-body text-foreground ${isChildMode ? "text-base font-semibold" : "text-sm"}`}>
            {isChildMode
              ? `Luyện tập mỗi ngày để giỏi hơn nè bạn nhỏ! 🌟💪`
              : `Chào ${userName || "bạn"}! Chọn chế độ luyện tập bạn muốn thử nhé! 🎯`}
          </p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card-pastel p-4 text-center">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="font-display font-bold text-foreground text-lg">3</p>
          <p className="text-[11px] text-muted-foreground font-body">Chế độ</p>
        </div>
        <div className="card-pastel p-4 text-center">
          <Star className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="font-display font-bold text-foreground text-lg">{reviewWords.length}</p>
          <p className="text-[11px] text-muted-foreground font-body">Từ vựng</p>
        </div>
        <div className="card-pastel p-4 text-center">
          <Zap className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="font-display font-bold text-foreground text-lg">∞</p>
          <p className="text-[11px] text-muted-foreground font-body">Luyện tập</p>
        </div>
      </div>

      {/* Mode cards */}
      <div className="space-y-4">
        {modes.map((mode, i) => (
          <motion.div key={mode.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActiveMode(mode.id)}
            className="card-pastel p-5 cursor-pointer hover:shadow-md hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: "var(--gradient-primary)" }}>
                {mode.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-display font-bold text-foreground ${isChildMode ? "text-lg" : "text-base"}`}>
                  {mode.label}
                </h3>
                <p className="text-xs text-muted-foreground font-body mt-0.5">{mode.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
