import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle, XCircle, Video, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import WebcamFeed from "@/components/WebcamFeed";

/* ═══════════════════════════════════════════════
   Lesson config per lesson ID
   ═══════════════════════════════════════════════ */

interface LessonConfig {
  videoSrc: string;
  word: string;
  practice:
    | { type: "quiz"; question: string; options: string[]; correctIdx: number }
    | { type: "camera"; instruction: string };
}

const LESSON_CONFIGS: Record<number, LessonConfig> = {
  101: {
    videoSrc: "/videos/xin-chao.mp4",
    word: "Xin chào",
    practice: {
      type: "quiz",
      question: "Ký hiệu này có nghĩa là gì?",
      options: ["Tạm biệt", "Xin chào", "Cảm ơn"],
      correctIdx: 1,
    },
  },
  102: {
    videoSrc: "/videos/tam-biet.mp4",
    word: "Tạm biệt",
    practice: {
      type: "camera",
      instruction: "Hãy thực hiện ký hiệu 'Tạm biệt' trước camera",
    },
  },
  1: {
    videoSrc: "/videos/dia-chi.mp4",
    word: "Địa chỉ",
    practice: {
      type: "quiz",
      question: "Ký hiệu này có nghĩa là gì?",
      options: ["Tiếp tân", "Địa chỉ", "Thói quen"],
      correctIdx: 1,
    },
  },
  2: {
    videoSrc: "/videos/tiep-tan.mp4",
    word: "Tiếp tân",
    practice: {
      type: "quiz",
      question: "Ký hiệu này có nghĩa là gì?",
      options: ["Địa chỉ", "Không nên", "Tiếp tân"],
      correctIdx: 2,
    },
  },
  3: {
    videoSrc: "/videos/thoi-quen.mp4",
    word: "Thói quen",
    practice: {
      type: "quiz",
      question: "Ký hiệu này có nghĩa là gì?",
      options: ["Thói quen", "Tiếp tân", "Địa chỉ"],
      correctIdx: 0,
    },
  },
  4: {
    videoSrc: "/videos/khong-nen.mp4",
    word: "Không nên",
    practice: {
      type: "camera",
      instruction: "Hãy thực hiện ký hiệu 'Không nên' trước camera",
    },
  },
  5: {
    videoSrc: "/videos/ngay-giai-phong.mp4",
    word: "Ngày giải phóng Miền Nam 30/4",
    practice: {
      type: "quiz",
      question: "Ký hiệu này có nghĩa là gì?",
      options: ["Thói quen", "Ngày giải phóng Miền Nam 30/4", "Không nên"],
      correctIdx: 1,
    },
  },
};

export function hasVideoLesson(lessonId: number): boolean {
  return lessonId in LESSON_CONFIGS;
}

/* ═══════════════════════════════════════════════
   Step components
   ═══════════════════════════════════════════════ */

function VideoPlayer({ src }: { src: string }) {
  return (
    <div className="aspect-video bg-muted rounded-2xl overflow-hidden w-full">
      <video
        key={src}
        src={src}
        className="w-full h-full object-cover"
        controls
        autoPlay
        playsInline
      />
    </div>
  );
}

function LoopingVideoPlayer({ src }: { src: string }) {
  return (
    <div className="aspect-video bg-muted rounded-2xl overflow-hidden w-full">
      <video
        key={src}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted
        autoPlay
        playsInline
      />
    </div>
  );
}

function QuizStep({
  config,
  videoSrc,
  onCorrect,
}: {
  config: Extract<LessonConfig["practice"], { type: "quiz" }>;
  videoSrc: string;
  onCorrect: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
  };

  const isCorrect = selected === config.correctIdx;

  return (
    <div className="space-y-6">
      <LoopingVideoPlayer src={videoSrc} />

      <h3 className="font-display font-bold text-foreground text-center text-lg">
        {config.question}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
        {config.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`card-pastel p-4 font-body font-semibold text-sm text-foreground transition-all min-h-[48px] ${
              showResult && idx === config.correctIdx
                ? "border-2 border-[hsl(var(--success))] bg-[hsl(var(--success))]/10"
                : showResult && idx === selected && !isCorrect
                ? "border-2 border-destructive bg-destructive/10 animate-shake"
                : selected === idx
                ? "border-2 border-primary"
                : "hover:border-primary hover:border-2"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className={`p-3 rounded-xl flex items-center gap-2 justify-center ${
            isCorrect ? "bg-[hsl(var(--success))]/10" : "bg-destructive/10"
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive" />
            )}
            <span className="font-body text-sm text-foreground">
              {isCorrect
                ? "Chính xác! 🎉"
                : `Sai rồi! Đáp án đúng: ${config.options[config.correctIdx]} 💪`}
            </span>
          </div>
          <button
            onClick={onCorrect}
            className="btn-primary-gradient w-full flex items-center justify-center gap-2 py-3"
          >
            Tiếp tục <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

function CameraStep({
  instruction,
  onSuccess,
}: {
  instruction: string;
  onSuccess: () => void;
}) {
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  const handleCamStatus = useRef((status: { isReady: boolean; error: string | null }) => {
    setCamReady(status.isReady);
    setCamError(status.error);
  }).current;

  const handleScan = () => {
    if (!camReady || scanning) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
      setTimeout(onSuccess, 800);
    }, 3000);
  };

  const canScan = camReady && !camError && !scanning && !scanDone;

  return (
    <div className="text-center space-y-6">
      <h3 className="font-display font-bold text-foreground text-lg">{instruction}</h3>

      <div className="relative">
        <WebcamFeed glowOnActive onStatusChange={handleCamStatus} />

        {scanning && (
          <>
            <div className="absolute inset-0 border-4 border-primary/60 rounded-2xl animate-pulse" />
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold">
              <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
              Đang quét AI...
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleScan}
        disabled={!canScan}
        className="btn-primary-gradient flex items-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
      >
        <Video className="w-4 h-4" /> {scanning ? "Đang quét..." : camError ? "Camera không khả dụng" : !camReady ? "Đang kết nối camera..." : "Bắt đầu quét AI"}
      </button>
    </div>
  );
}

function ResultStep({ word, onFinish, nextLessonName, onNextLesson }: { word: string; onFinish: () => void; nextLessonName?: string; onNextLesson?: () => void }) {
  return (
    <div className="text-center py-8 space-y-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
        <span className="text-7xl block">🎉</span>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">Xuất sắc!</h2>
        <p className="text-muted-foreground font-body">
          Bạn đã hoàn thành bài học <span className="font-semibold text-primary">"{word}"</span>
        </p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-col items-center gap-3">
        {nextLessonName && onNextLesson && (
          <button onClick={onNextLesson} className="btn-primary-gradient flex items-center gap-2 min-h-[48px]">
            <ArrowRight className="w-5 h-5" /> Học từ tiếp theo: {nextLessonName}
          </button>
        )}
        <button onClick={onFinish} className={`flex items-center gap-2 min-h-[48px] ${nextLessonName ? "text-muted-foreground font-body text-sm hover:text-foreground transition-colors" : "btn-primary-gradient"}`}>
          <CheckCircle className="w-5 h-5" /> Quay lại danh sách
        </button>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main LessonModal
   ═══════════════════════════════════════════════ */

interface LessonModalProps {
  lessonId: number;
  onClose: () => void;
  onComplete: () => void;
  nextLessonName?: string;
  onNextLesson?: () => void;
}

export default function LessonModal({ lessonId, onClose, onComplete, nextLessonName, onNextLesson }: LessonModalProps) {
  const config = LESSON_CONFIGS[lessonId];
  const { completeLesson } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const totalSteps = 3;

  if (!config) return null;

  const handlePracticeComplete = () => {
    setStep(3);
  };

  const handleFinish = () => {
    completeLesson(lessonId);
    onComplete();
  };

  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Top bar with progress */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <span className="text-xs text-muted-foreground font-body font-semibold shrink-0">
          {step} / {totalSteps}
        </span>
      </div>

      {/* Content - keyed by lessonId to force re-mount on lesson change */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key={`theory-${lessonId}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary mb-3">
                    Bước 1: Lý thuyết
                  </span>
                  <h2 className="font-display font-bold text-2xl text-foreground">
                    {config.word}
                  </h2>
                </div>

                <VideoPlayer src={config.videoSrc} />

                <p className="text-center text-muted-foreground font-body">
                  Xem video hướng dẫn ký hiệu "{config.word}" và ghi nhớ cách thực hiện.
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary-gradient flex items-center gap-2 min-h-[48px]"
                  >
                    Tiếp tục <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key={`practice-${lessonId}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center mb-6">
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-secondary/15 text-secondary mb-3">
                    Bước 2: Thực hành
                  </span>
                </div>

                {config.practice.type === "quiz" ? (
                  <QuizStep
                    config={config.practice}
                    videoSrc={config.videoSrc}
                    onCorrect={handlePracticeComplete}
                  />
                ) : (
                  <CameraStep
                    instruction={config.practice.instruction}
                    onSuccess={handlePracticeComplete}
                  />
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key={`result-${lessonId}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResultStep word={config.word} onFinish={handleFinish} nextLessonName={nextLessonName} onNextLesson={onNextLesson} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
