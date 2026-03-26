import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Camera, CheckCircle, XCircle, Type, Video, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LessonItem {
  id: number;
  word: string;
  description: string;
  videoPlaceholder: string;
  quiz?: {
    type: "multiple-choice" | "fill-blank" | "camera";
    question: string;
    options?: string[];
    correct?: number;
    blankSentence?: string;
    blankAnswer?: string;
  };
}

const lessons: LessonItem[] = [
  {
    id: 1, word: "Xin chào", description: "Lời chào cơ bản", videoPlaceholder: "👋",
    quiz: { type: "multiple-choice", question: "Ký hiệu 👋 có nghĩa là gì?", options: ["Tạm biệt", "Xin chào", "Cảm ơn", "Xin lỗi"], correct: 1 },
  },
  {
    id: 2, word: "Cảm ơn", description: "Bày tỏ lòng biết ơn", videoPlaceholder: "🙏",
    quiz: { type: "fill-blank", question: "Hoàn thành câu sau:", blankSentence: "Ký hiệu 🙏 trong VSL nghĩa là ___", blankAnswer: "cảm ơn" },
  },
  {
    id: 3, word: "Xin lỗi", description: "Nói lời xin lỗi", videoPlaceholder: "🙇",
    quiz: { type: "multiple-choice", question: "Chọn ký hiệu đúng cho 'Xin lỗi':", options: ["👋", "🙏", "🙇", "👍"], correct: 2 },
  },
  {
    id: 4, word: "Tạm biệt", description: "Lời chào tạm biệt", videoPlaceholder: "👋",
    quiz: { type: "camera", question: "Hãy thực hiện ký hiệu 'Tạm biệt' trước camera!" },
  },
  {
    id: 5, word: "Vâng / Đúng", description: "Đồng ý, xác nhận", videoPlaceholder: "👍",
    quiz: { type: "fill-blank", question: "Hoàn thành câu sau:", blankSentence: "Giơ ngón tay cái lên nghĩa là ___", blankAnswer: "vâng" },
  },
];

function MultipleChoiceQuiz({ quiz, onComplete }: { quiz: LessonItem["quiz"]; onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === quiz!.correct) {
      setTimeout(onComplete, 1200);
    }
  };

  const isCorrect = selected === quiz!.correct;

  return (
    <div>
      <h3 className="font-display font-bold text-foreground text-center mb-6">{quiz!.question}</h3>
      <div className="grid grid-cols-2 gap-3">
        {quiz!.options!.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`card-pastel p-4 font-body font-semibold text-sm text-foreground transition-all ${
              showResult && idx === quiz!.correct
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
          className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${
            isCorrect ? "bg-[hsl(var(--success))]/10" : "bg-destructive/10"
          }`}
        >
          {isCorrect ? <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" /> : <XCircle className="w-5 h-5 text-destructive" />}
          <span className="font-body text-sm text-foreground">{isCorrect ? "Chính xác! 🎉" : "Sai rồi! Hãy thử lại nhé! 💪"}</span>
        </motion.div>
      )}
    </div>
  );
}

function FillBlankQuiz({ quiz, onComplete }: { quiz: LessonItem["quiz"]; onComplete: () => void }) {
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    setShowResult(true);
    if (answer.trim().toLowerCase() === quiz!.blankAnswer!.toLowerCase()) {
      setTimeout(onComplete, 1200);
    }
  };

  const isCorrect = answer.trim().toLowerCase() === quiz!.blankAnswer!.toLowerCase();

  return (
    <div>
      <h3 className="font-display font-bold text-foreground text-center mb-4">{quiz!.question}</h3>
      <p className="font-body text-foreground text-center mb-6">{quiz!.blankSentence}</p>
      <div className="flex gap-3 max-w-sm mx-auto">
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Nhập câu trả lời..."
          className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button onClick={handleSubmit} className="btn-primary-gradient py-3 px-6 text-sm">
          Kiểm tra
        </button>
      </div>
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${isCorrect ? "bg-[hsl(var(--success))]/10" : "bg-destructive/10"}`}
        >
          {isCorrect ? <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" /> : <XCircle className="w-5 h-5 text-destructive" />}
          <span className="font-body text-sm text-foreground">
            {isCorrect ? "Chính xác! 🎉" : `Đáp án đúng: "${quiz!.blankAnswer}"`}
          </span>
        </motion.div>
      )}
    </div>
  );
}

function CameraQuiz({ quiz, onComplete }: { quiz: LessonItem["quiz"]; onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [recording, setRecording] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraOn(true);
      }
    } catch {
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const handleRecord = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      // Mock: always pass camera quiz
      onComplete();
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="text-center">
      <h3 className="font-display font-bold text-foreground mb-6">{quiz!.question}</h3>
      <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-4 relative">
        {cameraOn ? (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Camera className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-body text-sm">Bấm để mở camera</p>
          </div>
        )}
        {recording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full text-xs font-bold">
            <div className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
            Đang ghi hình...
          </div>
        )}
      </div>
      {!cameraOn ? (
        <button onClick={startCamera} className="btn-primary-gradient flex items-center gap-2 mx-auto">
          <Camera className="w-4 h-4" /> Mở camera
        </button>
      ) : (
        <button onClick={handleRecord} disabled={recording} className="btn-primary-gradient flex items-center gap-2 mx-auto disabled:opacity-50">
          <Video className="w-4 h-4" /> {recording ? "Đang ghi..." : "Bắt đầu thực hành"}
        </button>
      )}
    </div>
  );
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25] as const;

export default function LessonView() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"learn" | "quiz">("learn");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const { completeLesson } = useAuth();
  const lesson = lessons[current];

  const handleNext = () => {
    if (phase === "learn" && lesson.quiz) {
      setPhase("quiz");
    } else {
      completeLesson(lesson.id);
      if (current < lessons.length - 1) {
        setCurrent(current + 1);
        setPhase("learn");
      }
    }
  };

  const handleQuizComplete = () => {
    completeLesson(lesson.id);
    if (current < lessons.length - 1) {
      setTimeout(() => {
        setCurrent(current + 1);
        setPhase("learn");
      }, 500);
    }
  };

  const quizTypeIcon = lesson.quiz?.type === "multiple-choice" ? Type
    : lesson.quiz?.type === "fill-blank" ? Type
    : Camera;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-body">
            Bài {current + 1} / {lessons.length}
          </span>
          <div className="flex items-center gap-2">
            {phase === "quiz" && lesson.quiz && (
              <span className="text-xs bg-secondary/15 text-secondary px-2 py-0.5 rounded-full font-body">
                {lesson.quiz.type === "multiple-choice" ? "Trắc nghiệm" : lesson.quiz.type === "fill-blank" ? "Điền từ" : "Camera"}
              </span>
            )}
            <span className="text-sm text-accent font-semibold font-body">{lesson.word}</span>
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((current + (phase === "quiz" ? 0.5 : 0)) / lessons.length) * 100}%`,
              background: "var(--gradient-primary)",
            }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${current}-${phase}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {phase === "learn" ? (
            <>
              {/* Video container */}
              <div className="card-pastel aspect-video flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                <span className="text-8xl mb-4">{lesson.videoPlaceholder}</span>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <button className="btn-primary-gradient flex items-center gap-2 text-sm py-2 px-6">
                    <Play className="w-4 h-4" /> Xem video
                  </button>
                  {/* Speed control */}
                  <div className="relative">
                    <button
                      onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-foreground font-body text-xs font-semibold hover:bg-card transition-colors shadow-sm"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      {playbackSpeed}x
                    </button>
                    <AnimatePresence>
                      {speedMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[100px]"
                        >
                          {SPEED_OPTIONS.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => { setPlaybackSpeed(speed); setSpeedMenuOpen(false); }}
                              className={`w-full px-4 py-2.5 text-xs font-body font-medium text-left transition-colors ${
                                playbackSpeed === speed
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              {speed}x {speed === 1 && "(Mặc định)"}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div className="coral-box mb-6">{lesson.word}</div>
              <p className="text-center text-muted-foreground font-body mb-8">{lesson.description}</p>
            </>
          ) : (
            <div className="card-pastel p-8 mb-6">
              {lesson.quiz?.type === "multiple-choice" && (
                <MultipleChoiceQuiz quiz={lesson.quiz} onComplete={handleQuizComplete} />
              )}
              {lesson.quiz?.type === "fill-blank" && (
                <FillBlankQuiz quiz={lesson.quiz} onComplete={handleQuizComplete} />
              )}
              {lesson.quiz?.type === "camera" && (
                <CameraQuiz quiz={lesson.quiz} onComplete={handleQuizComplete} />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            if (phase === "quiz") {
              setPhase("learn");
            } else {
              setCurrent(Math.max(0, current - 1));
              setPhase("learn");
            }
          }}
          disabled={current === 0 && phase === "learn"}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border text-foreground font-body font-semibold disabled:opacity-40 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Trước
        </button>
        <button
          onClick={handleNext}
          disabled={current === lessons.length - 1 && phase === "quiz"}
          className="btn-primary-gradient flex items-center gap-2"
        >
          {phase === "learn" && lesson.quiz ? "Làm bài tập" : "Tiếp theo"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
