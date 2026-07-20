import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Crown,
  GraduationCap,
  Hash,
  HeartPulse,
  Lock,
  type LucideIcon,
  MessageCircle,
  Play,
  RotateCcw,
  Smile,
  Sparkles,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import VideoPlayer from "@/components/VideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { resolveAiPracticeTarget } from "@/services/aiRecognition";
import { trackAnalyticsEvent } from "@/services/analytics";
import { useSearchParams } from "react-router-dom";
import { FEATURED_UNIT_IDS } from "../constants/learning";

import {
  ChapterSummaryDto,
  dictionaryApi,
  DictionaryEntryDto,
  learningApi,
  LessonDetailDto,
  LessonProgressRequest,
  LessonQuizDto,
  LessonSummaryDto,
  PracticeItemSummaryDto,
  QuizSubmitResultDto,
  UnitSummaryDto,
} from "@/services/vsignApi";

const AiCameraPractice = lazy(() => import("@/components/AiCameraPractice"));
const PremiumModal = lazy(() => import("@/components/PremiumModal"));

type CourseChapter = ChapterSummaryDto;

type ViewState =
  | { view: "units" }
  | { view: "unit"; unitId: string };

/* ── Deterministic icon mapping ── */
const UNIT_ICON_KEYWORDS: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["giao tiếp", "hội thoại", "chào hỏi"], icon: MessageCircle },
  { keywords: ["trường", "học", "địa điểm"], icon: GraduationCap },
  { keywords: ["gia đình", "người thân"], icon: Users },
  { keywords: ["cảm xúc", "tính cách"], icon: Smile },
  { keywords: ["công việc", "nghề"], icon: Briefcase },
  { keywords: ["y tế", "sức khỏe", "bệnh"], icon: HeartPulse },
  { keywords: ["số", "đếm", "thời gian"], icon: Hash },
  { keywords: ["nâng cao", "chuyên ngành", "công nghệ"], icon: Sparkles },
];

const FALLBACK_ICONS: LucideIcon[] = [
  MessageCircle, BookOpen, Users, Smile, GraduationCap, Briefcase, HeartPulse, Hash, Sparkles,
];

function getApiMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      const lower = message.toLowerCase();
      if (lower.includes("lesson video progress") || lower.includes("lesson video stage")) {
        return "Tiến độ video chưa được backend ghi nhận. Vui lòng bấm Tiếp theo lại hoặc mở lại bài học.";
      }
      if (lower.includes("passed quiz")) {
        return "Quiz chưa được backend xác nhận là đạt. Vui lòng làm lại quiz.";
      }
      if (lower.includes("ai practice")) {
        return "Lượt luyện AI chưa được backend xác nhận là đạt. Vui lòng luyện lại ký hiệu bằng camera.";
      }
      return message;
    }
  }
  return fallback;
}

function getUnitIcon(unit: UnitSummaryDto, index: number): LucideIcon {
  const titleLower = (unit.title || "").toLowerCase();
  for (const mapping of UNIT_ICON_KEYWORDS) {
    if (mapping.keywords.some((kw) => titleLower.includes(kw))) return mapping.icon;
  }
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

/* ── In-memory cache (lives for the browser session) ── */
const chaptersCache = new Map<string, CourseChapter[]>();
const lessonsCache = new Map<string, LessonSummaryDto[]>();

/* ── Filter chips ── */
const FILTER_CHIPS = [
  { id: "all", label: "Tất cả" },
  { id: "basic", label: "Cơ bản" },
  { id: "common", label: "Thường dùng" },
  { id: "communication", label: "Giao tiếp" },
  { id: "specialized", label: "Chuyên ngành" },
  { id: "advanced", label: "Nâng cao" },
] as const;

type FilterId = (typeof FILTER_CHIPS)[number]["id"];

const INTERNAL_TEXT_PATTERNS = [
  "backend",
  "spring boot",
  "flyway",
  "mvp",
  "train ai",
  "đã train",
  "model",
  "mapping",
  "video_url",
  "metadata",
  "landmark",
  "ai label",
];

function hasInternalText(value?: string | null) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return INTERNAL_TEXT_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function productionDescription(value: string | undefined | null, fallback: string) {
  if (!value || hasInternalText(value)) return fallback;
  return value;
}

function unitFallbackDescription(unit: UnitSummaryDto) {
  const title = unit.title?.trim();
  return title ? `Học các ký hiệu về ${title.toLowerCase()}.` : "Khám phá các bài học ký hiệu theo chủ đề.";
}

function getUnitFilterId(unit: UnitSummaryDto, index: number): FilterId {
  const titleLower = (unit.title || "").toLowerCase();
  if (titleLower.includes("giao tiếp") || titleLower.includes("chào hỏi") || titleLower.includes("hội thoại")) return "communication";
  if (titleLower.includes("nâng cao") || titleLower.includes("chuyên ngành") || titleLower.includes("công nghệ")) return "advanced";
  if (titleLower.includes("y tế") || titleLower.includes("công việc")) return "specialized";
  // By index: first 2 = basic, next 2 = common, rest = communication
  if (index <= 1) return "basic";
  if (index <= 3) return "common";
  return "communication";
}

function lessonDuration(seconds: number) {
  if (!seconds) return "Chưa đặt thời lượng";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} phút`;
}

function lessonCompletionPercent(lesson: LessonSummaryDto) {
  if (lesson.status === "COMPLETED") return 100;
  if (lesson.status === "IN_PROGRESS") return 50;
  return 0;
}

function chapterProgress(chapter: CourseChapter, lessons?: LessonSummaryDto[]) {
  const total = lessons ? lessons.length : chapter.lessonCount;
  const completed = lessons
    ? lessons.filter((lesson) => lesson.status === "COMPLETED").length
    : Math.round((chapter.completionPercent / 100) * total);
  const percent = lessons
    ? total === 0
      ? chapter.completionPercent
      : Math.round(lessons.reduce((sum, lesson) => sum + lessonCompletionPercent(lesson), 0) / total)
    : chapter.completionPercent;
  return { completed, total, percent };
}

function unitProgress(unit: UnitSummaryDto) {
  return {
    completed: 0,
    total: 0,
    chaptersTotal: unit.chapterCount,
    percent: 0,
  };
}

function statusText(status: LessonSummaryDto["status"]) {
  if (status === "COMPLETED") return "Hoàn thành";
  if (status === "IN_PROGRESS") return "Đang học";
  return "Chưa bắt đầu";
}

function MissingVideoPanel({ title }: { title: string }) {
  return (
    <div className="aspect-video rounded-2xl border border-dashed border-border bg-muted/50 flex flex-col items-center justify-center text-center px-6">
      <Video className="w-12 h-12 text-muted-foreground mb-3" />
      <p className="font-display font-bold text-foreground">{title}</p>
      <p className="font-body text-sm text-muted-foreground mt-2 max-w-md">
        Video bài học đang được cập nhật. Vui lòng quay lại sau.
      </p>
    </div>
  );
}

/* ── Dynamic quiz (generated from dictionary entries) ── */

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type DynQuestion = {
  id: string;
  videoUrl: string;
  correctId: string;
  options: { id: string; text: string }[];
};

function buildDynamicQuestions(entries: DictionaryEntryDto[], count = 3): DynQuestion[] {
  const withVideo = entries.filter((e) => !!e.videoUrl);
  if (withVideo.length < count) return [];

  const pool = shuffleArray(withVideo);
  const correctEntries = pool.slice(0, count);
  const distractorPool = pool.slice(count);

  return correctEntries.map((entry, idx) => {
    const distractors: DictionaryEntryDto[] = [];
    for (const d of distractorPool) {
      if (distractors.length >= 2) break;
      if (!distractors.some((x) => x.word === d.word)) distractors.push(d);
    }
    // fall back to other correct entries if distractor pool too small
    for (const d of correctEntries) {
      if (distractors.length >= 2) break;
      if (d.id !== entry.id && !distractors.some((x) => x.word === d.word)) distractors.push(d);
    }

    const correctOptId = `opt-correct-${idx}`;
    const options = shuffleArray([
      { id: correctOptId, text: entry.word },
      ...distractors.map((d, di) => ({ id: `opt-wrong-${idx}-${di}`, text: d.word })),
    ]);

    return { id: `dyn-q-${idx}`, videoUrl: entry.videoUrl!, correctId: correctOptId, options };
  });
}

function DynamicQuizPanel({
  entries,
  onPassed,
}: {
  entries: DictionaryEntryDto[];
  onPassed: (result: QuizSubmitResultDto) => void;
}) {
  const questions = useMemo(() => buildDynamicQuestions(entries), [entries]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [localResult, setLocalResult] = useState<{ correct: number; passed: boolean } | null>(null);
  const [error, setError] = useState("");

  if (questions.length < 3) {
    return (
      <div className="text-center py-10">
        <p className="font-body text-muted-foreground mb-6">
          Chưa đủ từ vựng có video để tạo quiz. Hãy tiếp tục luyện tập với AI.
        </p>
      </div>
    );
  }

  const unanswered = questions.filter((q) => !answers[q.id]);

  const handleSubmit = () => {
    if (unanswered.length > 0) {
      setError(`Còn ${unanswered.length} câu chưa trả lời.`);
      return;
    }
    const correct = questions.filter((q) => answers[q.id] === q.correctId).length;
    const passed = correct >= 2;
    setLocalResult({ correct, passed });
    if (passed) {
      onPassed({
        attemptId: "local",
        score: Math.round((correct / questions.length) * 100),
        passed: true,
        xpAwarded: 15,
        reviewAvailable: false,
        timedOut: false,
        unansweredCount: 0,
      });
    }
  };

  if (localResult && !localResult.passed) {
    const score = Math.round((localResult.correct / questions.length) * 100);
    return (
      <div className="text-center py-6">
        <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
        <h3 className="font-display font-bold text-xl text-foreground">Chưa đạt yêu cầu</h3>
        <p className="font-body text-sm text-muted-foreground mt-2">
          Đúng: {localResult.correct}/{questions.length} · Điểm: {score}%
        </p>
        <button
          onClick={() => { setAnswers({}); setLocalResult(null); setError(""); }}
          className="btn-primary-gradient mt-5 inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {questions.map((question, questionIndex) => (
        <div key={question.id} className="card-pastel p-4">
          <div className="mb-3">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-primary/15 text-primary">
              Xem video → chọn từ đúng
            </span>
          </div>
          <VideoPlayer
            src={question.videoUrl}
            className="w-full aspect-video rounded-xl mb-3 overflow-hidden bg-black"
            preload="metadata"
            label={question.id}
            hideAnswer={true}
          />
          <div className="flex items-start gap-3 mb-4">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-display font-bold text-sm flex items-center justify-center shrink-0">
              {questionIndex + 1}
            </span>
            <h3 className="font-display font-bold text-foreground">
              Ký hiệu trong video có nghĩa là từ nào?
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setAnswers((curr) => ({ ...curr, [question.id]: option.id }))}
                  className={`rounded-2xl border p-3 text-left font-body text-sm font-semibold transition-all ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/60"
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="btn-primary-gradient w-full flex items-center justify-center gap-2"
      >
        Nộp bài kiểm tra
      </button>
    </div>
  );
}

function QuizPanel({
  quiz,
  lessonVideoUrl,
  accessToken,
  onPassed,
}: {
  quiz: LessonQuizDto;
  lessonVideoUrl?: string;
  accessToken?: string;
  onPassed: (result: QuizSubmitResultDto) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResultDto | null>(null);
  const [error, setError] = useState("");
  const startedAt = useMemo(() => Date.now(), [quiz.attemptId]);

  const unanswered = quiz.questions.filter((question) => !answers[question.id]);

  const handleSubmit = async () => {
    setError("");
    if (unanswered.length > 0) {
      setError(`Còn ${unanswered.length} câu chưa trả lời.`);
      return;
    }

    setSubmitting(true);
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const submitResult = await learningApi.submitLessonQuiz(
        quiz.attemptId,
        Object.entries(answers).map(([questionId, selectedAnswerId]) => ({ questionId, selectedAnswerId })),
        durationSeconds,
        accessToken
      );
      setResult(submitResult);
      if (submitResult.passed) {
        onPassed(submitResult);
      }
    } catch {
      setError("Không thể nộp bài kiểm tra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="text-center py-6">
        {result.passed ? (
          <CheckCircle className="w-14 h-14 text-[hsl(var(--success))] mx-auto mb-4" />
        ) : (
          <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
        )}
        <h3 className="font-display font-bold text-xl text-foreground">
          {result.passed ? "Đã vượt qua! Tiếp tục luyện tập AI →" : "Chưa đạt yêu cầu"}
        </h3>
        <p className="font-body text-sm text-muted-foreground mt-2">
          Điểm: {result.score}% · XP: {result.xpAwarded} · Câu bỏ trống: {result.unansweredCount}
        </p>
        {!result.passed && (
          <button
            onClick={() => {
              setAnswers({});
              setResult(null);
              setError("");
            }}
            className="btn-primary-gradient mt-5 inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Làm lại
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {quiz.questions.map((question, questionIndex) => {
        const hasVideoOptions = question.options.some((option) => Boolean(option.videoUrl));
        const showPromptVideo = !hasVideoOptions && !!lessonVideoUrl;
        return (
          <div key={question.id} className="card-pastel p-4">
            <div className="mb-3">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                showPromptVideo
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary/15 text-secondary"
              }`}>
                {showPromptVideo ? "Xem video -> chọn từ đúng" : "Đọc từ -> chọn video đúng"}
              </span>
            </div>

            {showPromptVideo && (
              <VideoPlayer
                src={lessonVideoUrl}
                className="w-full aspect-video rounded-xl mb-3 overflow-hidden bg-black"
                preload={questionIndex === 0 ? "auto" : "metadata"}
                label={question.prompt}
                hideAnswer={true}
              />
            )}

            <div className="flex items-start gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-display font-bold text-sm flex items-center justify-center shrink-0">
                {questionIndex + 1}
              </span>
              <h3 className={`font-display font-bold text-foreground ${!showPromptVideo ? "text-lg" : ""}`}>
                {question.prompt}
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                    className={`rounded-2xl border p-3 text-left font-body text-sm font-semibold transition-all overflow-hidden ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/60"
                    }`}
                  >
                    {option.videoUrl ? (
                      <div className="space-y-2">
                        <VideoPlayer
                          src={option.videoUrl}
                          className="w-full aspect-video rounded-xl overflow-hidden bg-black"
                          preload="metadata"
                          label={option.text}
                          hideAnswer={true}
                        />
                        <span className="block text-center">{option.text}</span>
                      </div>
                    ) : (
                      option.text
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="btn-primary-gradient w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting && <LoadingSpinner size="sm" />}
        Nộp bài kiểm tra
      </button>
    </div>
  );
}

function LessonStudyModal({
  lesson,
  onClose,
  onLessonCompleted,
  nextLesson = null,
  onNextLesson,
}: {
  lesson: LessonSummaryDto;
  onClose: () => void;
  onLessonCompleted: (lessonId: string) => void;
  nextLesson?: LessonSummaryDto | null;
  onNextLesson?: () => void;
}) {
  const { accessToken, refreshGamification } = useAuth();
  const [detail, setDetail] = useState<LessonDetailDto | null>(null);
  const [quiz, setQuiz] = useState<LessonQuizDto | null>(null);
  const [dictPool, setDictPool] = useState<DictionaryEntryDto[]>([]);
  const [lessonPracticeItem, setLessonPracticeItem] = useState<PracticeItemSummaryDto | null>(null);
  const [quizResult, setQuizResult] = useState<QuizSubmitResultDto | null>(null);
  const [step, setStep] = useState<"video" | "quiz" | "ai-practice" | "done">("video");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setDetail(null);
    setQuiz(null);
    setDictPool([]);
    setLessonPracticeItem(null);
    setQuizResult(null);
    setStep("video");

    Promise.all([
      learningApi.getLesson(lesson.lessonId, accessToken || undefined),
      learningApi.getLessonQuiz(lesson.lessonId, accessToken || undefined),
      learningApi.listPracticeItems({ size: 100 }, accessToken || undefined).catch(() => null),
    ])
      .then(([nextDetail, nextQuiz, practiceItemsPage]) => {
        if (cancelled) return;
        setDetail(nextDetail);
        setQuiz(nextQuiz);
        const matchingPracticeItem = practiceItemsPage?.content.find((item) => item.lessonId === lesson.lessonId) ?? null;
        setLessonPracticeItem(matchingPracticeItem);
        if (!nextQuiz) {
          dictionaryApi.listEntries({ size: 30 })
            .then((entries) => { if (!cancelled) setDictPool(entries.filter((e) => !!e.videoUrl)); })
            .catch(() => undefined);
        }
        void learningApi.updateProgress(
          lesson.lessonId,
          {
            completionPct: Math.max(nextDetail.progress?.completionPct ?? 0, 10),
            lastPositionSeconds: nextDetail.progress?.lastPositionSeconds ?? 0,
            phase: "VIDEO",
            currentQuestionIndex: nextDetail.progress?.currentQuestionIndex ?? null,
            status: "IN_PROGRESS",
          },
          accessToken || undefined
        ).catch(() => undefined);
      })
      .catch(() => {
        if (!cancelled) setError("Không thể tải bài học. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, lesson.lessonId]);

  const markCompleted = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      await learningApi.updateProgress(
        lesson.lessonId,
        {
          completionPct: 90,
          lastPositionSeconds: Math.max(detail?.durationSeconds ?? 0, detail?.progress?.lastPositionSeconds ?? 0),
          phase: "PRACTICE",
          currentQuestionIndex: null,
          status: "IN_PROGRESS",
        },
        accessToken || undefined
      );
      await learningApi.completeLesson(lesson.lessonId, accessToken || undefined);
      trackAnalyticsEvent("complete_lesson", {
        lesson_id: lesson.lessonId,
        lesson_title: lesson.title,
      });
      if (lesson.lessonId === "lesson-greetings-1") {
        trackAnalyticsEvent("complete_lesson_1");
      }
      await refreshGamification().catch(() => undefined);
      onLessonCompleted(lesson.lessonId);
      setStep("done");
    } catch (err) {
      setError(getApiMessage(err, "Backend chưa xác thực đủ video, quiz và luyện AI để hoàn thành bài học."));
    } finally {
      setSaving(false);
    }
  }, [accessToken, detail?.durationSeconds, detail?.progress?.lastPositionSeconds, lesson.lessonId, onLessonCompleted, refreshGamification]);

  const saveStageProgress = useCallback(
    async (
      completionPct: number,
      phase: LessonProgressRequest["phase"],
      currentQuestionIndex: number | null = null
    ) => {
      await learningApi.updateProgress(
        lesson.lessonId,
        {
          completionPct,
          lastPositionSeconds: phase === "VIDEO" ? detail?.progress?.lastPositionSeconds ?? 0 : detail?.durationSeconds ?? 0,
          phase,
          currentQuestionIndex,
          status: "IN_PROGRESS",
        },
        accessToken || undefined
      );
    },
    [accessToken, detail?.durationSeconds, detail?.progress?.lastPositionSeconds, lesson.lessonId]
  );

  const handleQuizPassed = useCallback(
    (result: QuizSubmitResultDto) => {
      setQuizResult(result);
      setStep("ai-practice");
      void saveStageProgress(65, "PRACTICE").catch(() => undefined);
    },
    [saveStageProgress]
  );
  const progressWidth = step === "video" ? 25 : step === "quiz" ? 50 : step === "ai-practice" ? 75 : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-body font-semibold shrink-0">
          {step === "video" ? "1" : step === "quiz" ? "2" : step === "ai-practice" ? "3" : "4"} / 4
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" message="Đang tải bài học..." />
            </div>
          ) : error ? (
            <div className="card-pastel p-6 text-center">
              <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
              <p className="font-body text-sm text-destructive">{error}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === "video" && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary mb-3">
                      Video mẫu
                    </span>
                    <h2 className="font-display font-bold text-2xl text-foreground">{detail?.title || lesson.title}</h2>
                    <p className="font-body text-sm text-muted-foreground mt-2">
                      {productionDescription(lesson.description, "Luyện tập ký hiệu qua video và bài kiểm tra.")}
                    </p>
                  </div>

                  {detail?.videoUrl ? (
                    <div className="aspect-video bg-black rounded-[28px] overflow-hidden w-full shadow-2xl">
                      <VideoPlayer
                        src={detail.videoUrl}
                        className="w-full h-full"
                        preload="auto"
                        label={detail.title}
                      />
                    </div>
                  ) : (
                    <MissingVideoPanel title={lesson.title} />
                  )}

                  <button
                    onClick={async () => {
                      await saveStageProgress(35, "QUIZ", quiz ? 0 : null).catch(() => undefined);
                      setStep("quiz");
                    }}
                    disabled={saving}
                    className="btn-primary-gradient flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    Tiếp theo <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {step === "quiz" && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-secondary/15 text-secondary mb-3">
                      Kiểm tra
                    </span>
                    <h2 className="font-display font-bold text-xl text-foreground">{lesson.title}</h2>
                  </div>
                  {quiz ? (
                    <QuizPanel
                      quiz={quiz}
                      lessonVideoUrl={detail?.videoUrl}
                      accessToken={accessToken || undefined}
                      onPassed={handleQuizPassed}
                    />
                  ) : import.meta.env.DEV ? (
                    <DynamicQuizPanel
                      entries={dictPool}
                      onPassed={handleQuizPassed}
                    />
                  ) : (
                    <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive text-center">
                      Backend chua co quiz cho bai hoc nay, nen chua the hoan thanh trong production.
                    </div>
                  )}
                </motion.div>
              )}

              {step === "ai-practice" && (
                <motion.div
                  key="ai-practice"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary mb-3 flex items-center gap-1.5 mx-auto w-fit">
                      <Cpu className="w-3.5 h-3.5" /> Luyện tập AI
                    </span>
                    <h2 className="font-display font-bold text-xl text-foreground">{lesson.title}</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      Thực hiện ký hiệu trước camera để hoàn thành bài học.
                    </p>
                  </div>

                  {(() => {
                    const practiceSource = lessonPracticeItem?.expectedGloss || lessonPracticeItem?.label || detail?.title || lesson.title;
                    const aiTarget = resolveAiPracticeTarget(practiceSource);
                    const targetDisplay = lessonPracticeItem?.label || aiTarget?.display || practiceSource;
                    const practiceItemId = lessonPracticeItem?.itemId || aiTarget?.practiceItemId;

                    return (
                      <div className="max-w-xl mx-auto space-y-4">
                        {detail?.videoUrl && (
                          <div className="rounded-[22px] overflow-hidden border border-border bg-card p-3 shadow-md animate-fade-in">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5 justify-center font-body">
                              <Video className="w-3.5 h-3.5 text-primary" /> Video mẫu hướng dẫn ký hiệu
                            </p>
                            <div className="aspect-video w-full max-w-[280px] mx-auto rounded-xl overflow-hidden shadow-inner bg-black">
                              <VideoPlayer
                                src={detail.videoUrl}
                                className="w-full h-full"
                                preload="auto"
                                label={`Hướng dẫn: ${targetDisplay}`}
                              />
                            </div>
                          </div>
                        )}

                        {(!aiTarget || !practiceItemId) && (
                          <div className="rounded-2xl bg-muted/60 border border-border px-4 py-3 text-sm font-body text-muted-foreground text-center">
                            Bài luyện tập này đang được cập nhật. Vui lòng chọn bài học khác hoặc quay lại sau.
                          </div>
                        )}

                        {aiTarget && practiceItemId && (
                          <Suspense fallback={<div className="card-pop p-6 text-center text-sm text-muted-foreground">Đang tải camera AI...</div>}>
                            <AiCameraPractice
                              key={lesson.lessonId}
                              question={`Thực hiện ký hiệu '${targetDisplay}' trước camera`}
                              targetLabel={aiTarget.label}
                              targetDisplay={targetDisplay}
                              practiceItemId={practiceItemId}
                              minConfidence={0.55}
                              onSuccess={() => void markCompleted()}
                              onSkip={() => void markCompleted()}
                            />
                          </Suspense>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {step === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-[hsl(var(--success))] mx-auto mb-4" />
                  <h2 className="font-display font-bold text-2xl text-foreground mb-2">Đã lưu tiến độ</h2>
                  <p className="font-body text-muted-foreground mb-6">Bài học "{lesson.title}" đã được lưu hoàn thành.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    {nextLesson && onNextLesson && !nextLesson.locked && (
                      <button onClick={onNextLesson} className="btn-primary-gradient inline-flex items-center justify-center gap-2 min-w-[160px]">
                        Bài học tiếp theo <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-card border border-border text-sm font-body font-semibold text-foreground hover:bg-muted transition-colors min-w-[160px]"
                    >
                      Quay về danh sách
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LessonsTimeline({
  chapter,
  unitTitle,
  onBack,
  onLessonCompleted,
}: {
  chapter: CourseChapter;
  unitTitle: string;
  onBack: () => void;
  onLessonCompleted: (lessonId: string) => void;
}) {
  const { accessToken } = useAuth();
  const [activeLesson, setActiveLesson] = useState<LessonSummaryDto | null>(null);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [lessons, setLessons] = useState<LessonSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const progress = chapterProgress(chapter, lessons);

  const nextLesson = useMemo(() => {
    if (!activeLesson) return null;
    const currentIndex = lessons.findIndex((l) => l.lessonId === activeLesson.lessonId);
    if (currentIndex === -1 || currentIndex === lessons.length - 1) return null;
    const next = lessons[currentIndex + 1];
    return next.locked ? null : next;
  }, [activeLesson, lessons]);

  const handleNextLesson = useCallback(() => {
    if (nextLesson) {
      setActiveLesson(nextLesson);
    }
  }, [nextLesson]);

  const loadLessons = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && lessonsCache.has(chapter.chapterId)) {
      setLessons(lessonsCache.get(chapter.chapterId)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await learningApi.listLessons(chapter.chapterId, accessToken || undefined);
      lessonsCache.set(chapter.chapterId, data);
      setLessons(data);
    } catch {
      setError("Không thể tải danh sách bài học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, chapter.chapterId]);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> {unitTitle}
      </button>

      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-foreground">{chapter.title}</h2>
        {chapter.description && (
          <p className="text-muted-foreground font-body text-sm mt-1">
            {productionDescription(chapter.description, "Hoàn thành các bài học trong phần học này.")}
          </p>
        )}
        <p className="text-muted-foreground font-body text-sm mt-2">
          {progress.completed} / {progress.total} bài học hoàn thành
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center [&>p]:hidden">
          <LoadingSpinner size="md" message="Đang tải bài học..." />
        </div>
      ) : error ? (
        <div className="card-pastel p-6 text-center">
          <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground mb-5">{error}</p>
          <button onClick={() => void loadLessons()} className="btn-primary-gradient inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Tải lại
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4">
            {lessons.map((lesson, idx) => {
            const isDone = lesson.status === "COMPLETED";
            const isLocked = lesson.locked;
            return (
              <motion.div
                key={lesson.lessonId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="relative pl-10 sm:pl-14"
              >
                <div className={`absolute left-2 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 sm:left-4 ${
                  isDone ? "bg-[hsl(var(--success))] border-[hsl(var(--success))]"
                    : isLocked ? "bg-muted border-muted-foreground/30"
                    : "bg-primary border-primary"
                }`}>
                  {isDone ? <CheckCircle className="w-3 h-3 text-primary-foreground" />
                    : isLocked ? <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                    : <Play className="w-2.5 h-2.5 text-primary-foreground" />}
                </div>

                <button
                  onClick={() => {
                    if (isLocked) {
                      setPremiumOpen(true);
                      return;
                    }
                    setActiveLesson(lesson);
                  }}
                  className={`w-full card-pastel p-4 flex flex-col gap-3 text-left transition-all min-[430px]:flex-row min-[430px]:items-center ${
                    isLocked ? "opacity-60 hover:ring-2 hover:ring-amber-300" : "hover:shadow-md hover:ring-2 hover:ring-primary/20"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone ? "bg-[hsl(var(--success))]/15" : isLocked ? "bg-muted" : "bg-primary/10"
                  }`}>
                    {isLocked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <BookOpen className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-foreground text-sm flex flex-wrap items-center gap-2">
                      {lesson.title}
                      {lesson.requiresPremium && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-body">Cao cấp</span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground font-body truncate">{productionDescription(lesson.description, "Nội dung bài học đang được cập nhật.")}</p>
                    <p className="text-[11px] text-muted-foreground font-body mt-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {lessonDuration(lesson.durationSeconds)} · {statusText(lesson.status)}
                    </p>
                  </div>
                  <div className="self-start min-[430px]:self-center">
                    {isDone ? (
                      <span className="text-xs text-[hsl(var(--success))] font-body font-semibold shrink-0">Hoàn thành</span>
                    ) : isLocked ? (
                      <span className="text-xs text-amber-700 font-body font-semibold shrink-0">Cao cấp</span>
                    ) : (
                      <Play className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeLesson && (
          <LessonStudyModal
            lesson={activeLesson}
            onClose={() => setActiveLesson(null)}
            onLessonCompleted={(lessonId) => {
              onLessonCompleted(lessonId);
              void loadLessons(true);
            }}
            nextLesson={nextLesson}
            onNextLesson={handleNextLesson}
          />
        )}
      </AnimatePresence>
      <Suspense fallback={null}>
        <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      </Suspense>
    </div>
  );
}

function ChaptersList({
  unit,
  onBack,
  onTreeChanged,
}: {
  unit: UnitSummaryDto;
  onBack: () => void;
  onTreeChanged: (lessonId: string) => void;
}) {
  const { accessToken } = useAuth();
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedChapter = chapters.find((chapter) => chapter.chapterId === selectedChapterId);

  const loadChapters = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && chaptersCache.has(unit.unitId)) {
      setChapters(chaptersCache.get(unit.unitId)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await learningApi.listChapters(unit.unitId, accessToken || undefined);
      chaptersCache.set(unit.unitId, data);
      setChapters(data);
    } catch {
      setError("Không thể tải danh sách phần học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, unit.unitId]);

  useEffect(() => {
    setSelectedChapterId(null);
    void loadChapters();
  }, [loadChapters]);

  if (selectedChapter) {
    return (
      <LessonsTimeline
        chapter={selectedChapter}
        unitTitle={unit.title}
        onBack={() => setSelectedChapterId(null)}
        onLessonCompleted={(lessonId) => {
          onTreeChanged(lessonId);
          void loadChapters(true);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Tất cả khóa học
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-primary)" }}>
          <BookOpen className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground leading-tight">{unit.title}</h2>
          <p className="text-muted-foreground font-body text-sm">
            {productionDescription(unit.description, unitFallbackDescription(unit))}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center [&>p]:hidden">
          <LoadingSpinner size="md" message="Đang tải danh sách phần học..." />
        </div>
      ) : error ? (
        <div className="card-pastel p-6 text-center">
          <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground mb-5">{error}</p>
          <button onClick={() => void loadChapters()} className="btn-primary-gradient inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Tải lại
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4">
            {chapters.map((chapter, idx) => {
            const progress = chapterProgress(chapter);
            const isLocked = chapter.locked;
            return (
              <motion.div
                key={chapter.chapterId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative pl-10 sm:pl-14"
              >
                <div className={`absolute left-2 top-5 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center sm:left-4 ${
                  progress.percent === 100 ? "bg-[hsl(var(--success))] border-[hsl(var(--success))]"
                    : isLocked ? "bg-muted border-muted-foreground/30"
                    : "bg-primary border-primary"
                }`}>
                  {progress.percent === 100 ? <CheckCircle className="w-3 h-3 text-primary-foreground" />
                    : isLocked ? <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                    : <span className="text-[9px] font-bold text-primary-foreground">{idx + 1}</span>}
                </div>

                <button
                  onClick={() => {
                    if (isLocked) {
                      setPremiumOpen(true);
                      return;
                    }
                    setSelectedChapterId(chapter.chapterId);
                  }}
                  className={`w-full card-pastel p-5 text-left transition-all ${
                    isLocked ? "opacity-60 hover:ring-2 hover:ring-amber-300" : "hover:shadow-md hover:ring-2 hover:ring-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-foreground text-base">{chapter.title}</h3>
                        {chapter.requiresPremium && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-body font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Cao cấp
                          </span>
                        )}
                      </div>
                      {chapter.description && (
                        <p className="text-xs text-muted-foreground font-body mb-1">
                          {productionDescription(chapter.description, "Hoàn thành các bài học trong phần học này.")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-body">
                        {progress.completed} / {progress.total} bài học hoàn thành
                      </p>
                    </div>
                    {isLocked ? (
                      <Crown className="w-6 h-6 text-amber-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress.percent}%`, background: isLocked ? "hsl(var(--muted-foreground))" : "var(--gradient-primary)" }}
                    />
                  </div>
                </button>
              </motion.div>
            );
          })}
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      </Suspense>
    </div>
  );
}

export default function VocabularyPack() {
  const { userName, layoutMode } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<ViewState>({ view: "units" });
  const [units, setUnits] = useState<UnitSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const queryUnitId = searchParams.get("unitId");

  useEffect(() => {
    if (queryUnitId && units.some((u) => u.unitId === queryUnitId)) {
      setState({ view: "unit", unitId: queryUnitId });
    } else {
      setState({ view: "units" });
    }
  }, [queryUnitId, units]);

  const handleFilterChange = (filterId: FilterId) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };
  const isChildMode = layoutMode === "child";

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const nextUnits = await learningApi.listUnits();
      setUnits(nextUnits.filter((unit) => FEATURED_UNIT_IDS.has(unit.unitId)));
    } catch {
      setError("Không thể tải khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const filteredUnits = useMemo(() => {
    if (activeFilter === "all") return units;
    return units.filter((unit, index) => getUnitFilterId(unit, index) === activeFilter);
  }, [units, activeFilter]);

  const totalPages = Math.ceil(filteredUnits.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUnits.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUnits, currentPage]);

  const selectedUnit = state.view === "unit"
    ? units.find((unit) => unit.unitId === state.unitId)
    : null;

  const handleLessonCompleted = () => {
    void loadCatalog();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" message="Đang tải khóa học..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="card-pastel p-6 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-foreground mb-2">Không tải được khóa học</h2>
          <p className="font-body text-sm text-muted-foreground mb-5">{error}</p>
          <button onClick={() => void loadCatalog()} className="btn-primary-gradient inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Tải lại
          </button>
        </div>
      </div>
    );
  }

  if (selectedUnit) {
    return (
      <ChaptersList
        unit={selectedUnit}
        onBack={() => setSearchParams({})}
        onTreeChanged={handleLessonCompleted}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header with mascot */}
      <div className="hero-panel p-4 md:p-7 flex items-center gap-4 md:gap-5 mb-5 md:mb-6 overflow-hidden">
        <motion.img
          src={mascotImg}
          alt="Mascot"
          className={`object-contain drop-shadow-lg shrink-0 hidden sm:block ${isChildMode ? "w-24 h-24" : "w-20 h-20"}`}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="speech-bubble flex-1 min-w-0 p-4 md:p-5">
          <p className={`font-display text-foreground ${isChildMode ? "text-xl font-extrabold" : "text-lg font-extrabold"}`}>
            {isChildMode
              ? `Chào bạn nhỏ ${userName || "ơi"}! Chọn một chủ đề để bắt đầu học nhé.`
              : `Chào ${userName || "bạn"}! Chọn một chủ đề để bắt đầu học nhé.`}
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            onClick={() => handleFilterChange(chip.id)}
            className={`shrink-0 font-body transition-all ${
              activeFilter === chip.id
                ? "chip-active"
                : "chip-soft text-muted-foreground hover:text-foreground"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Unit cards */}
      <div className="space-y-4">
        {filteredUnits.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-body text-muted-foreground">Không có khóa học nào trong danh mục này.</p>
          </div>
        )}
        {paginatedUnits.map((unit, index) => {
          const progress = unitProgress(unit);
          const UnitIcon = getUnitIcon(unit, index);
          const globalIndex = units.indexOf(unit);
          return (
            <motion.button
              key={unit.unitId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setSearchParams({ unitId: unit.unitId })}
              className="w-full card-pop p-4 md:p-6 text-left cursor-pointer hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="icon-tile !h-12 !w-12 shrink-0 md:!h-14 md:!w-14" style={{ background: "var(--gradient-primary)" }}>
                  <UnitIcon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                      Chủ đề {globalIndex + 1}
                    </span>
                    <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {progress.chaptersTotal || unit.chapterCount} phần học
                    </span>
                  </div>
                  <h3 className={`font-display font-extrabold text-foreground leading-tight ${isChildMode ? "text-xl" : "text-lg"}`}>{unit.title}</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    {productionDescription(unit.description, unitFallbackDescription(unit))}
                  </p>
                  <div className="flex flex-col gap-2 mt-2 min-[430px]:flex-row min-[430px]:items-center min-[430px]:gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress.percent}%`, background: "var(--gradient-primary)" }} />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-body font-semibold shrink-0">
                      {progress.total > 0 ? `${progress.completed}/${progress.total} bài` : `${progress.chaptersTotal} phần học`}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-3" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-card border border-border text-xs font-body font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:hover:bg-card transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Trang trước
          </button>
          <span className="text-xs font-body font-semibold text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-card border border-border text-xs font-body font-semibold text-foreground hover:bg-muted disabled:opacity-50 disabled:hover:bg-card transition-colors"
          >
            Trang sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
