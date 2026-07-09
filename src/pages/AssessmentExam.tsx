import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock,
  Flame,
  RotateCcw,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import VideoPlayer from "@/components/VideoPlayer";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/contexts/AuthContext";
import { dictionaryApi, DictionaryEntryDto } from "@/services/vsignApi";

// ── Local types ──────────────────────────────────────────────────────────────
interface LocalOption {
  id: string;
  text: string;
}
interface LocalQuestion {
  id: string;
  prompt: string;
  videoUrl?: string;
  options: LocalOption[];
  correctId: string;
}
interface ExamSet {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  cardClass: string;
  passingScore: number;
  questionCount: number;
  difficultyLevels?: number[];
  timeSeconds: number;
  xpReward: number;
}
interface ExamResult {
  correct: number;
  total: number;
  score: number;
  passed: boolean;
  xp: number;
}

// ── 3 exam sets ──────────────────────────────────────────────────────────────
const EXAM_SETS: ExamSet[] = [
  {
    id: "set-1",
    title: "Cơ bản",
    subtitle: "Bộ đề 1",
    description: "50 từ vựng giao tiếp hàng ngày, lý tưởng cho người mới bắt đầu.",
    icon: "🌱",
    cardClass:
      "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20",
    passingScore: 60,
    questionCount: 50,
    difficultyLevels: [1, 2],
    timeSeconds: 20 * 60,
    xpReward: 80,
  },
  {
    id: "set-2",
    title: "Trung cấp",
    subtitle: "Bộ đề 2",
    description: "50 từ vựng phong phú từ nhiều chủ đề, kiểm tra toàn diện.",
    icon: "⚡",
    cardClass:
      "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20",
    passingScore: 70,
    questionCount: 50,
    timeSeconds: 18 * 60,
    xpReward: 120,
  },
  {
    id: "set-3",
    title: "Nâng cao",
    subtitle: "Bộ đề 3",
    description: "50 từ vựng nâng cao, dành cho người học đã có nền tảng vững.",
    icon: "🔥",
    cardClass:
      "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20",
    passingScore: 80,
    questionCount: 50,
    difficultyLevels: [3, 4, 5],
    timeSeconds: 15 * 60,
    xpReward: 160,
  },
];

// ── Utilities ────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(pool: DictionaryEntryDto[], set: ExamSet): LocalQuestion[] {
  let filtered = set.difficultyLevels
    ? pool.filter((e) => set.difficultyLevels!.includes(e.difficultyLevel))
    : pool;

  // Fall back to full pool if difficulty filter yields too few entries
  if (filtered.length < 10) filtered = pool;

  const selected = shuffle(filtered).slice(0, set.questionCount);

  return selected.map((entry, idx) => {
    const hasVideo = !!entry.videoUrl;

    const desc = entry.description || entry.keyword || entry.word;
    const prompt = hasVideo
      ? "Ký hiệu trong video có nghĩa là từ nào?"
      : `Ký hiệu nào có nghĩa: "${
          desc.length > 90 ? desc.slice(0, 90) + "…" : desc
        }"`;

    // Pick 3 distractors that are different words
    const others = pool.filter(
      (e) => e.entryId !== entry.entryId && e.word !== entry.word
    );
    const distractors = shuffle(others).slice(0, 3);

    const correctId = `correct-${idx}`;
    const options: LocalOption[] = shuffle([
      { id: correctId, text: entry.word },
      ...distractors.map((d, i) => ({ id: `wrong-${idx}-${i}`, text: d.word })),
    ]);

    return {
      id: `q-${idx}-${entry.entryId}`,
      prompt,
      videoUrl: entry.videoUrl,
      options,
      correctId,
    };
  });
}

function gradeExam(
  questions: LocalQuestion[],
  answers: Record<string, string>
): ExamResult & { passed: boolean } {
  const correct = questions.filter((q) => answers[q.id] === q.correctId).length;
  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { correct, total, score, passed: false, xp: 0 };
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Component ────────────────────────────────────────────────────────────────
type Phase = "loading" | "select" | "ready" | "exam" | "result";

export default function AssessmentExam() {
  const { awardQuizXp } = useAuth();

  const [phase, setPhase] = useState<Phase>("loading");
  const [dictPool, setDictPool] = useState<DictionaryEntryDto[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedSet, setSelectedSet] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitWarning, setSubmitWarning] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  // Load dictionary on mount
  useEffect(() => {
    dictionaryApi
      .listEntries({ size: 100 })
      .then((entries) => {
        setDictPool(entries);
        setPhase("select");
      })
      .catch(() => {
        setLoadError("Không thể tải từ điển. Vui lòng thử lại.");
        setPhase("select");
      });
  }, []);

  // Countdown timer — only restarts when phase or result changes
  useEffect(() => {
    if (phase !== "exam" || result) return;
    const id = window.setInterval(
      () => setTimeLeft((v) => Math.max(0, v - 1)),
      1000
    );
    return () => window.clearInterval(id);
  }, [phase, result]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (phase === "exam" && !result && timeLeft === 0) {
      finishExam(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const unanswered = useMemo(
    () => questions.filter((q) => !answers[q.id]),
    [answers, questions]
  );

  // ── Actions ──────────────────────────────────────────────────────────────
  const selectSet = (set: ExamSet) => {
    setSelectedSet(set);
    setPhase("ready");
  };

  const startExam = () => {
    if (!selectedSet) return;
    if (dictPool.length === 0) {
      setLoadError("Từ điển chưa tải được. Vui lòng tải lại trang.");
      return;
    }
    let qs: LocalQuestion[];
    try {
      qs = buildQuestions(dictPool, selectedSet);
    } catch (err) {
      setLoadError(`Lỗi tạo câu hỏi: ${String(err)}`);
      return;
    }
    if (qs.length === 0) {
      setLoadError(
        `Từ điển (${dictPool.length} từ) không đủ dữ liệu để tạo bài thi. Vui lòng tải lại.`
      );
      return;
    }
    setQuestions(qs);
    setCurrentQ(0);
    setAnswers({});
    setTimeLeft(selectedSet.timeSeconds);
    setResult(null);
    setSubmitWarning(false);
    setPhase("exam");
  };

  const finishExam = (force = false) => {
    if (!force && unanswered.length > 0) {
      setSubmitWarning(true);
      return;
    }
    const { correct, total, score } = gradeExam(questions, answers);
    const passed = score >= (selectedSet?.passingScore ?? 60);
    const xp = passed
      ? (selectedSet?.xpReward ?? 80)
      : Math.round((selectedSet?.xpReward ?? 80) * 0.2);
    const res: ExamResult = { correct, total, score, passed, xp };
    setResult(res);
    awardQuizXp(`assessment-${selectedSet?.id ?? "set"}-${Date.now()}`, xp, passed);
    setPhase("result");
  };

  const resetToSelect = () => {
    setPhase("select");
    setSelectedSet(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setSubmitWarning(false);
  };

  const retryExam = () => {
    setResult(null);
    setPhase("ready");
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" message="Đang tải từ điển…" />
        </div>
      </div>
    );
  }

  // ── Select ───────────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-2xl text-foreground">Thi thử</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Chọn bộ đề phù hợp với trình độ của bạn
            {dictPool.length > 0 && ` · ${dictPool.length} từ vựng trong kho`}
          </p>
          {loadError && <p className="text-xs text-destructive mt-1">{loadError}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          {EXAM_SETS.map((set, i) => (
            <motion.button
              key={set.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => selectSet(set)}
              className={`card-pop p-6 text-left flex flex-col gap-3 hover:-translate-y-1 transition-all cursor-pointer border ${set.cardClass}`}
            >
              <span className="text-4xl">{set.icon}</span>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  {set.subtitle}
                </p>
                <h3 className="font-display font-extrabold text-xl text-foreground">{set.title}</h3>
              </div>
              <p className="font-body text-sm text-muted-foreground flex-1">{set.description}</p>
              <div className="flex flex-wrap gap-2 text-xs font-body">
                <span className="bg-background/60 rounded-full px-2 py-0.5">{set.questionCount} câu</span>
                <span className="bg-background/60 rounded-full px-2 py-0.5">Đạt {set.passingScore}%</span>
                <span className="bg-background/60 rounded-full px-2 py-0.5">
                  {Math.floor(set.timeSeconds / 60)} phút
                </span>
                <span className="bg-background/60 rounded-full px-2 py-0.5">+{set.xpReward} XP</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ── Ready ────────────────────────────────────────────────────────────────
  if (phase === "ready" && selectedSet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <motion.img
            src={mascotImg}
            alt="Mascot"
            className="w-28 h-28 object-contain mx-auto mb-6 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            {selectedSet.subtitle}
          </p>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            {selectedSet.icon} {selectedSet.title}
          </h2>
          <p className="text-muted-foreground font-body mb-6">{selectedSet.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-8 text-sm font-body">
            <div className="card-pastel p-3 flex flex-col items-center gap-1">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground text-lg">{selectedSet.questionCount}</span>
              <span className="text-muted-foreground text-xs">Câu hỏi</span>
            </div>
            <div className="card-pastel p-3 flex flex-col items-center gap-1">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground text-lg">
                {Math.floor(selectedSet.timeSeconds / 60)}
              </span>
              <span className="text-muted-foreground text-xs">Phút làm bài</span>
            </div>
            <div className="card-pastel p-3 flex flex-col items-center gap-1">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-foreground text-lg">{selectedSet.passingScore}%</span>
              <span className="text-muted-foreground text-xs">Điểm đạt</span>
            </div>
            <div className="card-pastel p-3 flex flex-col items-center gap-1">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-foreground text-lg">{selectedSet.xpReward}</span>
              <span className="text-muted-foreground text-xs">XP phần thưởng</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetToSelect}
              className="px-5 py-2.5 rounded-xl border border-border text-foreground font-body text-sm hover:bg-muted transition-colors"
            >
              ← Chọn bộ khác
            </button>
            <button onClick={startExam} className="btn-primary-gradient text-lg px-10 py-3">
              Bắt đầu thi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
          >
            {result.passed ? (
              <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-destructive mx-auto mb-4" />
            )}
          </motion.div>

          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            {result.passed ? "Chúc mừng! Đạt bài thi 🎉" : "Chưa đạt — cố lên!"}
          </h2>
          <p className="text-lg text-muted-foreground font-body mb-1">
            {result.correct}/{result.total} câu đúng
          </p>
          <p className="text-4xl font-display font-extrabold text-primary mb-6">{result.score}%</p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="card-pastel px-5 py-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-display font-bold text-foreground">+{result.xp} XP</span>
            </div>
            {result.passed && (
              <div className="card-pastel px-5 py-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-foreground">Đạt chuẩn!</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetToSelect}
              className="px-5 py-2.5 rounded-xl border border-border text-foreground font-body text-sm hover:bg-muted transition-colors"
            >
              ← Bộ đề khác
            </button>
            <button onClick={retryExam} className="btn-primary-gradient flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Thi lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Exam ─────────────────────────────────────────────────────────────────
  if (phase !== "exam") return null;

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-sm text-center card-pastel p-8">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h3 className="font-display font-bold text-foreground mb-2">Không thể tạo bài thi</h3>
          <p className="text-sm text-muted-foreground font-body mb-5">
            {loadError || `Từ điển có ${dictPool.length} từ nhưng không đủ để tạo câu hỏi.`}
          </p>
          <button onClick={resetToSelect} className="btn-primary-gradient">
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft <= 60;

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full min-h-0">
      {/* Submit warning overlay */}
      {submitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="card-pastel max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-display font-bold text-foreground">Còn câu chưa trả lời</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Còn {unanswered.length} câu bỏ trống. Bạn muốn xem lại hay nộp luôn?
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  const first = questions.findIndex((q) => !answers[q.id]);
                  if (first >= 0) setCurrentQ(first);
                  setSubmitWarning(false);
                }}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-body font-semibold text-foreground hover:bg-muted"
              >
                Xem lại
              </button>
              <button
                onClick={() => finishExam(true)}
                className="btn-primary-gradient text-sm py-2 px-4"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Clock
            className={`w-5 h-5 ${isUrgent ? "text-destructive animate-pulse" : "text-primary"}`}
          />
          <span
            className={`font-display font-bold text-lg ${
              isUrgent ? "text-destructive" : "text-foreground"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
          {selectedSet && (
            <span className="text-xs text-muted-foreground font-body ml-2 hidden sm:inline">
              {selectedSet.icon} {selectedSet.title}
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground font-body">
          Đã trả lời: {answeredCount}/{questions.length}
        </span>
      </div>

      {/* Question nav bubbles */}
      <div className="flex gap-1 mb-4 flex-wrap max-h-24 overflow-y-auto shrink-0 pb-1">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentQ(index)}
            className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              index === currentQ
                ? "bg-primary text-primary-foreground shadow-md"
                : answers[q.id]
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.18 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Video card — full width, prominent */}
            {current.videoUrl && (
              <div className="card-pastel overflow-hidden mb-3 shrink-0 rounded-2xl">
                <VideoPlayer
                  src={current.videoUrl}
                  autoPlay
                  loop
                  muted
                  controls={false}
                  preload="auto"
                  className="w-full bg-black"
                  videoClassName="w-full object-cover"
                  maxHeight="340px"
                  label={current.prompt}
                  hideAnswer={true}
                />
              </div>
            )}

            {/* Question text card */}
            <div className="card-pastel px-6 py-4 text-center mb-4 shrink-0">
              <span className="inline-block px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-body mb-2">
                Câu {currentQ + 1} / {questions.length}
              </span>
              <h3 className="text-base font-display font-bold text-foreground">{current.prompt}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              {current.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [current.id]: option.id }))
                  }
                  className={`card-pastel p-4 font-body font-semibold text-foreground text-sm transition-all ${
                    answers[current.id] === option.id
                      ? "border-2 border-primary bg-primary/10"
                      : "hover:border-2 hover:border-secondary"
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="flex justify-between items-center mt-4 shrink-0">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="px-5 py-2 rounded-xl border border-border text-foreground font-body text-sm disabled:opacity-40 hover:bg-muted transition-colors"
        >
          Trước
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="btn-primary-gradient text-sm py-2 px-5"
          >
            Tiếp
          </button>
        ) : (
          <button
            onClick={() => finishExam(false)}
            className="btn-primary-gradient text-sm py-2 px-5"
          >
            Nộp bài
          </button>
        )}
      </div>
    </div>
  );
}
