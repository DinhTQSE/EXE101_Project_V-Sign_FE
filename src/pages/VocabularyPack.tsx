import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, CheckCircle, Play, Crown, ChevronLeft, ChevronRight,
  Camera, Video, XCircle, BookOpen, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import mascotImg from "@/assets/mascot.png";
import PremiumModal from "@/components/PremiumModal";
import LessonModal, { hasVideoLesson } from "@/components/LessonModal";
import WebcamFeed from "@/components/WebcamFeed";

/* ═══════════════════════════════════════════════
   MOCK DATA: Unit → Chapter → Lesson
   ═══════════════════════════════════════════════ */

interface LessonData {
  id: number;
  title: string;
  emoji: string;
  description: string;
  type: "standard" | "ai_review";
  videoUrl?: string;
  quiz?: {
    type: "multiple-choice" | "fill-blank" | "camera";
    question: string;
    options?: string[];
    correct?: number;
    blankSentence?: string;
    blankAnswer?: string;
  };
}

interface Chapter {
  id: number;
  title: string;
  lessons: LessonData[];
}

interface Unit {
  id: number;
  title: string;
  description: string;
  emoji: string;
  chapters: Chapter[];
}

const units: Unit[] = [
  {
    id: 1, title: "Giới thiệu", description: "Làm quen với ngôn ngữ ký hiệu Việt Nam", emoji: "👋",
    chapters: [
      {
        id: 101, title: "Từ vựng VSL cơ bản",
        lessons: [
          { id: 101, title: "Xin chào", emoji: "👋", description: "Lời chào cơ bản trong giao tiếp hàng ngày", type: "standard",
            videoUrl: "/videos/xin-chao.mp4",
            quiz: { type: "multiple-choice", question: "Ký hiệu này có nghĩa là gì?", options: ["Tạm biệt", "Xin chào", "Cảm ơn", "Xin lỗi"], correct: 1 } },
          { id: 102, title: "Tạm biệt", emoji: "👋", description: "Lời chào khi chia tay", type: "standard",
            videoUrl: "/videos/tam-biet.mp4",
            quiz: { type: "fill-blank", question: "Hoàn thành câu:", blankSentence: "Khi chia tay, ta nói ___", blankAnswer: "tạm biệt" } },
          { id: 1, title: "Địa chỉ", emoji: "📍", description: "Ký hiệu 'Địa chỉ' trong ngôn ngữ ký hiệu Việt Nam", type: "standard",
            videoUrl: "/videos/dia-chi.mp4",
            quiz: { type: "multiple-choice", question: "Ký hiệu này có nghĩa là gì?", options: ["Tiếp tân", "Địa chỉ", "Thói quen", "Không nên"], correct: 1 } },
          { id: 2, title: "Tiếp tân", emoji: "🤝", description: "Ký hiệu 'Tiếp tân' trong ngôn ngữ ký hiệu Việt Nam", type: "standard",
            videoUrl: "/videos/tiep-tan.mp4",
            quiz: { type: "fill-blank", question: "Hoàn thành câu:", blankSentence: "Người đón khách ở sảnh gọi là ___", blankAnswer: "tiếp tân" } },
          { id: 3, title: "Thói quen", emoji: "🔄", description: "Ký hiệu 'Thói quen' trong ngôn ngữ ký hiệu Việt Nam", type: "standard",
            videoUrl: "/videos/thoi-quen.mp4",
            quiz: { type: "multiple-choice", question: "Ký hiệu này có nghĩa là gì?", options: ["Địa chỉ", "Thói quen", "Tiếp tân", "Không nên"], correct: 1 } },
          { id: 4, title: "Không nên", emoji: "🚫", description: "Ký hiệu 'Không nên' trong ngôn ngữ ký hiệu Việt Nam", type: "standard",
            videoUrl: "/videos/khong-nen.mp4",
            quiz: { type: "fill-blank", question: "Hoàn thành câu:", blankSentence: "Hành vi xấu là điều ___", blankAnswer: "không nên" } },
          { id: 5, title: "Ngày giải phóng Miền Nam 30/4", emoji: "🇻🇳", description: "Ký hiệu 'Ngày giải phóng Miền Nam 30/4' trong VSL", type: "standard",
            videoUrl: "/videos/ngay-giai-phong.mp4",
            quiz: { type: "multiple-choice", question: "Ký hiệu này có nghĩa là gì?", options: ["Thói quen", "Ngày giải phóng Miền Nam 30/4", "Không nên", "Địa chỉ"], correct: 1 } },
          { id: 6, title: "Ôn tập AI", emoji: "🤖", description: "Luyện tập với camera", type: "ai_review",
            quiz: { type: "camera", question: "Hãy thực hiện ký hiệu 'Xin chào' trước camera!" } },
        ],
      },
      {
        id: 102, title: "Giới thiệu bản thân",
        lessons: [
          { id: 7, title: "Tên tôi là...", emoji: "🙋", description: "Cách giới thiệu tên", type: "standard",
            quiz: { type: "multiple-choice", question: "Chỉ vào ngực nghĩa là?", options: ["Bạn", "Tôi", "Anh ấy", "Cô ấy"], correct: 1 } },
          { id: 8, title: "Tôi là...", emoji: "👤", description: "Nói về nghề nghiệp", type: "standard",
            quiz: { type: "fill-blank", question: "Hoàn thành:", blankSentence: "Chỉ vào ngực rồi mô tả công việc nghĩa là 'Tôi là ___'", blankAnswer: "giáo viên" } },
          { id: 9, title: "Ôn tập AI", emoji: "🤖", description: "Luyện tập giới thiệu bản thân", type: "ai_review",
            quiz: { type: "camera", question: "Giới thiệu bản thân bạn bằng ngôn ngữ ký hiệu!" } },
        ],
      },
      {
        id: 103, title: "Lịch sự & Lễ phép",
        lessons: [
          { id: 10, title: "Xin lỗi", emoji: "🙇", description: "Nói lời xin lỗi", type: "standard",
            quiz: { type: "multiple-choice", question: "Ký hiệu 🙇 là gì?", options: ["Cảm ơn", "Xin chào", "Xin lỗi", "Tạm biệt"], correct: 2 } },
          { id: 11, title: "Làm ơn / Vui lòng", emoji: "🤲", description: "Lời đề nghị lịch sự", type: "standard",
            quiz: { type: "fill-blank", question: "Hoàn thành:", blankSentence: "___ cho tôi hỏi", blankAnswer: "vui lòng" } },
          { id: 12, title: "Ôn tập AI", emoji: "🤖", description: "Thực hành các cụm từ lịch sự", type: "ai_review",
            quiz: { type: "camera", question: "Thực hiện ký hiệu 'Xin lỗi' và 'Cảm ơn' liên tiếp!" } },
        ],
      },
    ],
  },
  {
    id: 2, title: "Cuộc sống hàng ngày", description: "Từ vựng cho sinh hoạt thường ngày", emoji: "🏠",
    chapters: [
      {
        id: 201, title: "Gia đình & Người thân",
        lessons: [
          { id: 11, title: "Bố / Mẹ", emoji: "👨‍👩", description: "Ký hiệu cho bố và mẹ", type: "standard",
            quiz: { type: "multiple-choice", question: "Ký hiệu nào chỉ 'Bố'?", options: ["Chạm trán", "Chạm cằm", "Vẫy tay", "Gật đầu"], correct: 0 } },
          { id: 12, title: "Anh / Chị / Em", emoji: "👫", description: "Ký hiệu anh chị em", type: "standard",
            quiz: { type: "fill-blank", question: "Hoàn thành:", blankSentence: "Người lớn hơn mình trong gia đình gọi là ___", blankAnswer: "anh chị" } },
          { id: 13, title: "Ông / Bà", emoji: "👴👵", description: "Ký hiệu ông bà", type: "standard",
            quiz: { type: "multiple-choice", question: "👴 biểu thị ai?", options: ["Bố", "Ông", "Chú", "Anh"], correct: 1 } },
          { id: 14, title: "Ôn tập AI", emoji: "🤖", description: "Thực hành ký hiệu gia đình", type: "ai_review",
            quiz: { type: "camera", question: "Thực hiện ký hiệu 'Con' trước camera!" } },
        ],
      },
      {
        id: 202, title: "Đồ ăn & Thức uống",
        lessons: [
          { id: 15, title: "Cơm / Phở", emoji: "🍚", description: "Món ăn phổ biến", type: "standard",
            quiz: { type: "multiple-choice", question: "🍚 là ký hiệu của?", options: ["Bánh mì", "Cơm", "Phở", "Bún"], correct: 1 } },
          { id: 16, title: "Nước / Trà / Cà phê", emoji: "☕", description: "Đồ uống hàng ngày", type: "standard",
            quiz: { type: "fill-blank", question: "Hoàn thành:", blankSentence: "Buổi sáng uống một ly ___", blankAnswer: "cà phê" } },
          { id: 17, title: "Ôn tập AI", emoji: "🤖", description: "Luyện tập với camera", type: "ai_review",
            quiz: { type: "camera", question: "Thực hiện ký hiệu 'Nước' trước camera!" } },
        ],
      },
      {
        id: 203, title: "Hoạt động hàng ngày",
        lessons: [
          { id: 18, title: "Ăn / Uống", emoji: "🍽️", description: "Hoạt động ăn uống", type: "standard",
            quiz: { type: "multiple-choice", question: "Đưa tay lên miệng là ký hiệu?", options: ["Uống", "Ăn", "Nói", "Hát"], correct: 1 } },
          { id: 19, title: "Ngủ / Thức dậy", emoji: "😴", description: "Giấc ngủ và thức dậy", type: "standard",
            quiz: { type: "fill-blank", question: "Hoàn thành:", blankSentence: "Nhắm mắt, tay áp má nghĩa là ___", blankAnswer: "ngủ" } },
          { id: 20, title: "Đi làm / Đi học", emoji: "🏫", description: "Hoạt động hàng ngày", type: "standard",
            quiz: { type: "multiple-choice", question: "🏫 liên quan đến?", options: ["Đi chợ", "Đi học", "Đi chơi", "Đi ngủ"], correct: 1 } },
          { id: 21, title: "Ôn tập AI", emoji: "🤖", description: "Ôn lại toàn bộ chương", type: "ai_review",
            quiz: { type: "camera", question: "Thực hiện lại ký hiệu 'Đi học' trước camera!" } },
        ],
      },
    ],
  },
  {
    id: 3, title: "Cảm xúc & Giao tiếp", description: "Diễn đạt cảm xúc và giao tiếp xã hội", emoji: "💬",
    chapters: [
      {
        id: 301, title: "Cảm xúc & Tâm trạng",
        lessons: [
          { id: 22, title: "Vui / Buồn", emoji: "😊😢", description: "Biểu đạt cảm xúc", type: "standard",
            quiz: { type: "multiple-choice", question: "😊 biểu thị cảm xúc?", options: ["Buồn", "Vui", "Giận", "Sợ"], correct: 1 } },
          { id: 23, title: "Giận / Sợ", emoji: "😠😨", description: "Cảm xúc mạnh", type: "standard",
            quiz: { type: "fill-blank", question: "Hoàn thành:", blankSentence: "Mặt đỏ, tay nắm chặt nghĩa là ___", blankAnswer: "giận" } },
          { id: 24, title: "Ôn tập AI", emoji: "🤖", description: "Thực hành biểu đạt cảm xúc", type: "ai_review",
            quiz: { type: "camera", question: "Thực hiện ký hiệu 'Vui' trước camera!" } },
        ],
      },
      {
        id: 302, title: "Giao tiếp nâng cao",
        lessons: [
          { id: 25, title: "Tại bệnh viện", emoji: "🏥", description: "Giao tiếp y tế", type: "standard",
            quiz: { type: "multiple-choice", question: "🏥 là địa điểm?", options: ["Trường học", "Bệnh viện", "Siêu thị", "Công ty"], correct: 1 } },
          { id: 26, title: "Tại siêu thị", emoji: "🛒", description: "Mua sắm", type: "standard",
            quiz: { type: "fill-blank", question: "Hoàn thành:", blankSentence: "Đẩy xe hàng đi mua đồ ở ___", blankAnswer: "siêu thị" } },
          { id: 27, title: "Ôn tập AI", emoji: "🤖", description: "Luyện tập giao tiếp nâng cao", type: "ai_review",
            quiz: { type: "camera", question: "Thực hiện ký hiệu 'Bệnh viện' trước camera!" } },
        ],
      },
      {
        id: 303, title: "Chuyên sâu & Chứng chỉ",
        lessons: [
          { id: 28, title: "Phiên dịch cơ bản", emoji: "🗣️", description: "Kỹ năng phiên dịch", type: "standard",
            quiz: { type: "multiple-choice", question: "Phiên dịch viên cần?", options: ["Chỉ biết nói", "Biết cả VSL và tiếng Việt", "Chỉ biết VSL", "Không cần gì"], correct: 1 } },
          { id: 29, title: "Ngữ pháp VSL", emoji: "📖", description: "Cấu trúc câu trong VSL", type: "standard",
            quiz: { type: "fill-blank", question: "Hoàn thành:", blankSentence: "Trong VSL, thứ tự câu thường là ___", blankAnswer: "chủ ngữ vị ngữ" } },
          { id: 30, title: "Bài thi cuối khóa", emoji: "🎓", description: "Kiểm tra tổng hợp", type: "standard",
            quiz: { type: "multiple-choice", question: "Bài thi cuối khóa gồm?", options: ["Chỉ trắc nghiệm", "Trắc nghiệm + thực hành", "Chỉ camera", "Không thi"], correct: 1 } },
          { id: 31, title: "Ôn tập AI", emoji: "🤖", description: "Hoàn thành khóa học!", type: "ai_review",
            quiz: { type: "camera", question: "Thực hiện ký hiệu 'Cảm ơn' để kết thúc khóa học!" } },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════
   QUIZ SUB-COMPONENTS (unchanged logic)
   ═══════════════════════════════════════════════ */

function MultipleChoiceQuiz({ quiz, onComplete }: { quiz: LessonData["quiz"]; onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === quiz!.correct) setTimeout(onComplete, 1200);
  };
  const isCorrect = selected === quiz!.correct;
  return (
    <div>
      <h3 className="font-display font-bold text-foreground text-center mb-6">{quiz!.question}</h3>
      <div className="grid grid-cols-2 gap-3">
        {quiz!.options!.map((opt, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)}
            className={`card-pastel p-4 font-body font-semibold text-sm text-foreground transition-all ${
              showResult && idx === quiz!.correct ? "border-2 border-[hsl(var(--success))] bg-[hsl(var(--success))]/10"
              : showResult && idx === selected && !isCorrect ? "border-2 border-destructive bg-destructive/10 animate-shake"
              : selected === idx ? "border-2 border-primary" : "hover:border-primary hover:border-2"
            }`}
          >{opt}</button>
        ))}
      </div>
      {showResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${isCorrect ? "bg-[hsl(var(--success))]/10" : "bg-destructive/10"}`}>
          {isCorrect ? <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" /> : <XCircle className="w-5 h-5 text-destructive" />}
          <span className="font-body text-sm text-foreground">{isCorrect ? "Chính xác! 🎉" : "Sai rồi! Hãy thử lại nhé! 💪"}</span>
        </motion.div>
      )}
    </div>
  );
}

function FillBlankQuiz({ quiz, onComplete }: { quiz: LessonData["quiz"]; onComplete: () => void }) {
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const isCorrect = answer.trim().toLowerCase() === quiz!.blankAnswer!.toLowerCase();
  const handleSubmit = () => {
    setShowResult(true);
    if (answer.trim().toLowerCase() === quiz!.blankAnswer!.toLowerCase()) setTimeout(onComplete, 1200);
  };
  return (
    <div>
      <h3 className="font-display font-bold text-foreground text-center mb-4">{quiz!.question}</h3>
      <p className="font-body text-foreground text-center mb-6">{quiz!.blankSentence}</p>
      <div className="flex gap-3 max-w-sm mx-auto">
        <input type="text" value={answer} onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Nhập câu trả lời..."
          className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={handleSubmit} className="btn-primary-gradient py-3 px-6 text-sm">Kiểm tra</button>
      </div>
      {showResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${isCorrect ? "bg-[hsl(var(--success))]/10" : "bg-destructive/10"}`}>
          {isCorrect ? <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" /> : <XCircle className="w-5 h-5 text-destructive" />}
          <span className="font-body text-sm text-foreground">{isCorrect ? "Chính xác! 🎉" : `Đáp án đúng: "${quiz!.blankAnswer}"`}</span>
        </motion.div>
      )}
    </div>
  );
}

function CameraQuiz({ quiz, onComplete }: { quiz: LessonData["quiz"]; onComplete: () => void }) {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onComplete();
    }, 3000);
  };

  return (
    <div className="text-center">
      <h3 className="font-display font-bold text-foreground mb-6">{quiz!.question}</h3>
      <div className="relative mb-4">
        <WebcamFeed glowOnActive />
        {scanning && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold">
            <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" /> Đang quét AI...
          </div>
        )}
      </div>
      <button onClick={handleScan} disabled={scanning} className="btn-primary-gradient flex items-center gap-2 mx-auto disabled:opacity-50">
        <Video className="w-4 h-4" /> {scanning ? "Đang quét..." : "Bắt đầu thực hành"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LESSON SCREEN
   ═══════════════════════════════════════════════ */

function LessonScreen({ lesson, onComplete, onBack, lessonIndex, totalLessons }: {
  lesson: LessonData; onComplete: () => void; onBack: () => void;
  lessonIndex: number; totalLessons: number;
}) {
  const [phase, setPhase] = useState<"learn" | "quiz">("learn");
  const [showVideo, setShowVideo] = useState(false);
  const handleQuizComplete = () => { setTimeout(onComplete, 500); };
  const hasVideo = !!lesson.videoUrl || hasVideoLesson(lesson.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <span className="text-sm text-muted-foreground font-body">Bài {lessonIndex + 1} / {totalLessons}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((lessonIndex + (phase === "quiz" ? 0.5 : 0)) / totalLessons) * 100}%`, background: "var(--gradient-primary)" }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${lesson.id}-${phase}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
          {phase === "learn" ? (
            <>
              {lesson.videoUrl ? (
                <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-6">
                  <video
                    key={lesson.videoUrl}
                    src={lesson.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    playsInline
                  />
                </div>
              ) : (
                <div className="card-pastel aspect-video flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                  <span className="text-8xl mb-4">{lesson.emoji}</span>
                  {hasVideoLesson(lesson.id) && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <button onClick={() => setShowVideo(true)} className="btn-primary-gradient flex items-center gap-2 text-sm py-2 px-6">
                        <Play className="w-4 h-4" /> Xem video
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="coral-box mb-6 break-words">{lesson.title}</div>
              <p className="text-center text-muted-foreground font-body mb-8">{lesson.description}</p>
              <div className="flex justify-center">
                <button onClick={() => lesson.quiz ? setPhase("quiz") : onComplete()}
                  className="btn-primary-gradient flex items-center gap-2">
                  {lesson.quiz ? "Làm bài tập" : "Hoàn thành"} <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Video modal overlay (fallback for lessons only in LessonModal) */}
              {showVideo && hasVideoLesson(lesson.id) && (
                <LessonModal
                  lessonId={lesson.id}
                  onClose={() => setShowVideo(false)}
                  onComplete={() => setShowVideo(false)}
                />
              )}
            </>
          ) : (
            <div className="card-pastel p-8 mb-6">
              {/* Show video hint button during quiz phase */}
              {hasVideo && (
                <div className="flex justify-center mb-4">
                  <button onClick={() => setShowVideo(!showVideo)} className="flex items-center gap-2 text-sm text-primary font-body hover:underline">
                    <Video className="w-4 h-4" /> Xem lại video
                  </button>
                </div>
              )}
              {showVideo && lesson.videoUrl && (
                <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-6">
                  <video key={lesson.videoUrl} src={lesson.videoUrl} className="w-full h-full object-cover" controls autoPlay playsInline />
                </div>
              )}
              {lesson.quiz?.type === "multiple-choice" && <MultipleChoiceQuiz quiz={lesson.quiz} onComplete={handleQuizComplete} />}
              {lesson.quiz?.type === "fill-blank" && <FillBlankQuiz quiz={lesson.quiz} onComplete={handleQuizComplete} />}
              {lesson.quiz?.type === "camera" && <CameraQuiz quiz={lesson.quiz} onComplete={handleQuizComplete} />}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   VIEW C: Lessons Timeline (inside a chapter)
   ═══════════════════════════════════════════════ */

function LessonsTimeline({ chapter, unitTitle, onBack, onChapterComplete, isPremium }: {
  chapter: Chapter; unitTitle: string; onBack: () => void; onChapterComplete: () => void; isPremium: boolean;
}) {
  const { stats, completeLesson } = useAuth();
  const [activeLessonIdx, setActiveLessonIdx] = useState<number | null>(null);
  const [videoLessonId, setVideoLessonId] = useState<number | null>(null);
  const [premiumOpen, setPremiumOpen] = useState(false);

  const handleLessonComplete = (lessonId: number, idx: number) => {
    completeLesson(lessonId);
    if (idx < chapter.lessons.length - 1) {
      setActiveLessonIdx(idx + 1);
    } else {
      setActiveLessonIdx(null);
      onChapterComplete();
    }
  };

  const startLesson = (lesson: LessonData, idx: number) => {
    if (hasVideoLesson(lesson.id)) {
      setVideoLessonId(lesson.id);
    } else {
      setActiveLessonIdx(idx);
    }
  };

  // Video lesson modal overlay
  if (videoLessonId !== null) {
    const idx = chapter.lessons.findIndex(l => l.id === videoLessonId);
    const nextLesson = idx >= 0 && idx < chapter.lessons.length - 1 ? chapter.lessons[idx + 1] : null;
    const nextHasVideo = nextLesson ? hasVideoLesson(nextLesson.id) : false;
    return (
      <>
        <LessonModal
          key={videoLessonId}
          lessonId={videoLessonId}
          onClose={() => setVideoLessonId(null)}
          onComplete={() => {
            setVideoLessonId(null);
            if (idx >= 0) handleLessonComplete(videoLessonId, idx);
          }}
          nextLessonName={nextHasVideo && nextLesson ? nextLesson.title : undefined}
          onNextLesson={nextHasVideo && nextLesson ? () => {
            if (idx >= 0) handleLessonComplete(videoLessonId, idx);
            setVideoLessonId(nextLesson.id);
          } : undefined}
        />
      </>
    );
  }

  if (activeLessonIdx !== null) {
    const lesson = chapter.lessons[activeLessonIdx];
    return (
      <LessonScreen
        lesson={lesson}
        lessonIndex={activeLessonIdx}
        totalLessons={chapter.lessons.length}
        onBack={() => setActiveLessonIdx(null)}
        onComplete={() => handleLessonComplete(lesson.id, activeLessonIdx)}
      />
    );
  }

  const completedCount = chapter.lessons.filter(l => stats.completedLessons.includes(l.id)).length;
  const firstIncomplete = chapter.lessons.findIndex(l => !stats.completedLessons.includes(l.id) && l.type === "standard");

  return (
    <div className="max-w-2xl mx-auto relative pb-24">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> {unitTitle}
      </button>

      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-foreground">{chapter.title}</h2>
        <p className="text-muted-foreground font-body text-sm mt-1">
          {completedCount} / {chapter.lessons.length} bài học hoàn thành
        </p>
      </div>

      {/* Vertical timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {chapter.lessons.map((lesson, idx) => {
            const isDone = stats.completedLessons.includes(lesson.id);
            const isAiLocked = lesson.type === "ai_review" && !isPremium;

            return (
              <motion.div key={lesson.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }} className="relative pl-14">
                {/* Timeline node */}
                <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${
                  isDone ? "bg-[hsl(var(--success))] border-[hsl(var(--success))]"
                  : isAiLocked ? "bg-muted border-muted-foreground/30"
                  : "bg-primary border-primary"
                }`}>
                  {isDone ? <CheckCircle className="w-3 h-3 text-primary-foreground" />
                   : isAiLocked ? <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                   : <Play className="w-2.5 h-2.5 text-primary-foreground" />}
                </div>

                <button
                  onClick={() => {
                    if (isAiLocked) { setPremiumOpen(true); return; }
                    startLesson(lesson, idx);
                  }}
                  disabled={isAiLocked}
                  className={`w-full card-pastel p-4 flex items-center gap-4 text-left transition-all ${
                    isAiLocked ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:ring-2 hover:ring-primary/20"
                  } ${isDone ? "opacity-80" : ""}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isDone ? "bg-[hsl(var(--success))]/15"
                    : isAiLocked ? "bg-muted"
                    : "bg-primary/10"
                  }`}>
                    {isAiLocked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <span>{lesson.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                      {lesson.title}
                      {isAiLocked && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-body">PRO</span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground font-body truncate">{lesson.description}</p>
                  </div>
                  {isDone ? (
                    <span className="text-xs text-[hsl(var(--success))] font-body font-semibold shrink-0">Hoàn thành</span>
                  ) : isAiLocked ? (
                    <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Play className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sticky CTA */}
      {firstIncomplete >= 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-40">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => startLesson(chapter.lessons[firstIncomplete], firstIncomplete)}
              className="btn-primary-gradient w-full flex items-center justify-center gap-2"
            >
              Tiếp tục học <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CHAPTER COMPLETE SCREEN
   ═══════════════════════════════════════════════ */

function ChapterCompleteScreen({ chapter, nextChapter, onGoNext, onBackToUnit, isPremium }: {
  chapter: Chapter; nextChapter: Chapter | null; onGoNext: () => void; onBackToUnit: () => void; isPremium: boolean;
}) {
  const isNextLocked = nextChapter && !isPremium;
  const [premiumOpen, setPremiumOpen] = useState(false);

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
        <span className="text-7xl block mb-4">🎉</span>
      </motion.div>
      <motion.img src={mascotImg} alt="Mascot" className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-lg"
        animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Hoàn thành {chapter.title}!</h2>
      <p className="text-muted-foreground font-body mb-8">Tuyệt vời! Bạn đã hoàn thành tất cả bài học trong chương này.</p>
      <div className="space-y-3">
        {nextChapter && (
          isNextLocked ? (
            <button onClick={() => setPremiumOpen(true)} className="w-full btn-primary-gradient flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" /> Mở khóa {nextChapter.title}
            </button>
          ) : (
            <button onClick={onGoNext} className="w-full btn-primary-gradient flex items-center justify-center gap-2">
              Tiếp tục: {nextChapter.title} <ChevronRight className="w-5 h-5" />
            </button>
          )
        )}
        <button onClick={onBackToUnit}
          className="w-full px-6 py-3 rounded-2xl border border-border text-foreground font-body font-semibold hover:bg-muted transition-colors">
          Quay lại danh sách chương
        </button>
      </div>
      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   VIEW B: Chapters List (inside a unit)
   ═══════════════════════════════════════════════ */

function ChaptersList({ unit, onBack, isPremium }: {
  unit: Unit; onBack: () => void; isPremium: boolean;
}) {
  const { stats } = useAuth();
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number | null>(null);
  const [completedChapterIdx, setCompletedChapterIdx] = useState<number | null>(null);
  const [premiumOpen, setPremiumOpen] = useState(false);

  // Chapter complete flow
  if (completedChapterIdx !== null) {
    const ch = unit.chapters[completedChapterIdx];
    const next = completedChapterIdx < unit.chapters.length - 1 ? unit.chapters[completedChapterIdx + 1] : null;
    return (
      <ChapterCompleteScreen
        chapter={ch}
        nextChapter={next}
        isPremium={isPremium}
        onGoNext={() => { setCompletedChapterIdx(null); setSelectedChapterIdx(completedChapterIdx + 1); }}
        onBackToUnit={() => { setCompletedChapterIdx(null); setSelectedChapterIdx(null); }}
      />
    );
  }

  // Lesson timeline for a selected chapter
  if (selectedChapterIdx !== null) {
    return (
      <LessonsTimeline
        chapter={unit.chapters[selectedChapterIdx]}
        unitTitle={unit.title}
        isPremium={isPremium}
        onBack={() => setSelectedChapterIdx(null)}
        onChapterComplete={() => setCompletedChapterIdx(selectedChapterIdx)}
      />
    );
  }

  const getChapterProgress = (ch: Chapter) => {
    const done = ch.lessons.filter(l => stats.completedLessons.includes(l.id)).length;
    return { done, total: ch.lessons.length, percent: Math.round((done / ch.lessons.length) * 100) };
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground font-body hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Tất cả khóa học
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "var(--gradient-primary)" }}>
          {unit.emoji}
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">{unit.title}</h2>
          <p className="text-muted-foreground font-body text-sm">{unit.description}</p>
        </div>
      </div>

      {/* Vertical timeline of chapters */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-4">
          {unit.chapters.map((ch, idx) => {
            const progress = getChapterProgress(ch);
            const isFirst = idx === 0;
            const isLocked = !isFirst && !isPremium;

            return (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }} className="relative pl-14"
              >
                {/* Timeline node */}
                <div className={`absolute left-4 top-5 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center ${
                  progress.percent === 100 ? "bg-[hsl(var(--success))] border-[hsl(var(--success))]"
                  : isLocked ? "bg-muted border-muted-foreground/30"
                  : "bg-primary border-primary"
                }`}>
                  {progress.percent === 100 ? <CheckCircle className="w-3 h-3 text-primary-foreground" />
                   : isLocked ? <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                   : <span className="text-[9px] font-bold text-primary-foreground">{idx + 1}</span>}
                </div>

                <div
                  onClick={() => {
                    if (isLocked) { setPremiumOpen(true); return; }
                    setSelectedChapterIdx(idx);
                  }}
                  className={`card-pastel p-5 cursor-pointer transition-all ${
                    isLocked ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:ring-2 hover:ring-primary/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-foreground text-base">{ch.title}</h3>
                        {isLocked && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-body font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> PRO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-body">
                        {progress.done} / {progress.total} bài học hoàn thành
                      </p>
                    </div>
                    {isLocked ? (
                      <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-amber-500" />
                      </div>
                    ) : progress.percent === 100 ? (
                      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--success))]/15 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />
                      </div>
                    ) : (
                      <button className="btn-primary-gradient py-2 px-5 text-sm flex items-center gap-1"
                        onClick={e => { e.stopPropagation(); setSelectedChapterIdx(idx); }}>
                        {progress.done > 0 ? "Tiếp tục" : "Bắt đầu"} <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress.percent}%`, background: isLocked ? "hsl(var(--muted-foreground))" : "var(--gradient-primary)" }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   VIEW A: Units Dashboard (Main Route)
   ═══════════════════════════════════════════════ */

type ViewState =
  | { view: "units" }
  | { view: "unit"; unitIdx: number };

export default function VocabularyPack() {
  const { userName, stats, isPremium, layoutMode } = useAuth();
  const [state, setState] = useState<ViewState>({ view: "units" });
  const isChildMode = layoutMode === "child";

  const getUnitProgress = (unit: Unit) => {
    const allLessons = unit.chapters.flatMap(ch => ch.lessons);
    const done = allLessons.filter(l => stats.completedLessons.includes(l.id)).length;
    return { done, total: allLessons.length, chaptersTotal: unit.chapters.length };
  };

  if (state.view === "unit") {
    return (
      <ChaptersList
        unit={units[state.unitIdx]}
        isPremium={isPremium}
        onBack={() => setState({ view: "units" })}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Mascot greeting */}
      <div className="flex items-start gap-4 mb-8">
        <motion.img src={mascotImg} alt="Mascot"
          className={`object-contain drop-shadow-lg shrink-0 ${isChildMode ? "w-24 h-24" : "w-20 h-20"}`}
          animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
        <div className="speech-bubble flex-1">
          <p className={`font-body text-foreground ${isChildMode ? "text-base font-semibold" : "text-sm"}`}>
            {isChildMode
              ? `Chào bạn nhỏ ${userName || "ơi"}! 🌈 Chọn khóa học để bắt đầu phiêu lưu nhé! 🚀✨`
              : `Chào ${userName || "bạn"}! Chọn khóa học bạn muốn bắt đầu. Tất cả đều mở cho bạn khám phá! 🚀`}
          </p>
        </div>
      </div>

      {/* Unit cards */}
      <div className="space-y-4">
        {units.map((unit, i) => {
          const progress = getUnitProgress(unit);
          const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

          return (
            <motion.div key={unit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setState({ view: "unit", unitIdx: i })}
              className="card-pastel p-5 cursor-pointer hover:shadow-md hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: "var(--gradient-primary)" }}>
                  {unit.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary mb-1">
                    UNIT {unit.id}
                  </span>
                  <h3 className={`font-display font-bold text-foreground ${isChildMode ? "text-lg" : "text-base"}`}>
                    {unit.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{unit.description}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    {progress.done} / {progress.total} bài học · {progress.chaptersTotal} chương
                  </p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2 max-w-xs">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, background: "var(--gradient-primary)" }} />
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
