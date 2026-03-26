import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import mascotImg from "@/assets/mascot.png";

interface ExamQuestion {
  emoji: string;
  question: string;
  options: string[];
  correct: number;
  type: "text" | "image";
}

const examQuestions: ExamQuestion[] = [
  { emoji: "👋", question: "Ký hiệu này có nghĩa là gì?", options: ["Xin chào", "Tạm biệt", "Cảm ơn", "Xin lỗi"], correct: 0, type: "image" },
  { emoji: "🙏", question: "Đây là ký hiệu của từ nào?", options: ["Xin lỗi", "Cảm ơn", "Giúp đỡ", "Xin chào"], correct: 1, type: "image" },
  { emoji: "🙇", question: "Ký hiệu nào thể hiện 'Xin lỗi'?", options: ["👋", "🙏", "🙇", "👍"], correct: 2, type: "text" },
  { emoji: "👨‍👩‍👧", question: "Ký hiệu này thuộc chủ đề nào?", options: ["Chào hỏi", "Gia đình", "Đồ ăn", "Số đếm"], correct: 1, type: "image" },
  { emoji: "🔢", question: "Từ 'Ba' trong VSL dùng mấy ngón tay?", options: ["2 ngón", "3 ngón", "4 ngón", "5 ngón"], correct: 1, type: "text" },
  { emoji: "🍚", question: "Ký hiệu này đại diện cho từ nào?", options: ["Nước", "Cơm", "Trái cây", "Bánh mì"], correct: 1, type: "image" },
  { emoji: "🎨", question: "Chủ đề 'Màu sắc' bao gồm từ nào?", options: ["Cơm, Nước", "Bố, Mẹ", "Đỏ, Xanh, Vàng", "Sáng, Chiều"], correct: 2, type: "text" },
  { emoji: "⏰", question: "Ký hiệu 'Sáng' thuộc bài học nào?", options: ["Chào hỏi", "Gia đình", "Thời gian", "Số đếm"], correct: 2, type: "text" },
  { emoji: "👍", question: "Đây là ký hiệu của từ nào?", options: ["Không", "Vâng / Đúng", "Xin lỗi", "Tạm biệt"], correct: 1, type: "image" },
  { emoji: "🏫", question: "Từ 'Thầy' và 'Cô' thuộc chủ đề nào?", options: ["Gia đình", "Trường học", "Thời gian", "Hoạt động"], correct: 1, type: "text" },
];

const EXAM_TIME = 15 * 60; // 15 minutes in seconds

export default function MockExam() {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(examQuestions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!started || submitted) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleAnswer = useCallback((idx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
  }, [currentQ]);

  const handleSubmit = () => setSubmitted(true);

  const score = answers.reduce((acc, a, i) => acc + (a === examQuestions[i].correct ? 1 : 0), 0);

  const handleReset = () => {
    setStarted(false);
    setTimeLeft(EXAM_TIME);
    setCurrentQ(0);
    setAnswers(new Array(examQuestions.length).fill(null));
    setSubmitted(false);
  };

  // Start screen
  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <motion.img
          src={mascotImg}
          alt="Mascot"
          className="w-28 h-28 object-contain mx-auto mb-6 drop-shadow-lg"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <h2 className="text-3xl font-display font-bold text-foreground mb-4">Thi thử VSL</h2>
        <p className="text-muted-foreground font-body mb-2">
          {examQuestions.length} câu hỏi · {EXAM_TIME / 60} phút
        </p>
        <p className="text-muted-foreground font-body text-sm mb-8">
          Bao gồm câu hỏi nhận diện ký hiệu và câu hỏi kiến thức. Hệ thống tự động nộp bài khi hết giờ.
        </p>
        <button onClick={() => setStarted(true)} className="btn-primary-gradient text-lg px-10 py-3">
          Bắt đầu thi
        </button>
      </div>
    );
  }

  // Results screen
  if (submitted) {
    const percentage = Math.round((score / examQuestions.length) * 100);
    const passed = percentage >= 70;
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl mb-4">
          {passed ? "🎉" : "💪"}
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          {passed ? "Chúc mừng!" : "Cố gắng thêm nhé!"}
        </h2>
        <p className="text-lg text-muted-foreground font-body mb-6">
          Bạn đạt <span className="text-primary font-bold">{score}/{examQuestions.length}</span> điểm ({percentage}%)
        </p>

        {/* Review answers */}
        <div className="space-y-3 mb-8 text-left">
          {examQuestions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            return (
              <div key={i} className={`card-pastel p-4 flex items-start gap-3 ${isCorrect ? "border-l-4 border-[hsl(var(--success))]" : "border-l-4 border-destructive"}`}>
                <span className="text-2xl">{q.emoji}</span>
                <div className="flex-1">
                  <p className="font-body text-sm text-foreground font-medium">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-[hsl(var(--success))]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-xs font-body text-muted-foreground">
                      {isCorrect
                        ? `Đúng: ${q.options[q.correct]}`
                        : `Sai (chọn: ${answers[i] !== null ? q.options[answers[i]!] : "Chưa trả lời"}) · Đáp án: ${q.options[q.correct]}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={handleReset} className="btn-primary-gradient flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Thi lại
        </button>
      </div>
    );
  }

  // Exam in progress
  const q = examQuestions[currentQ];
  const answeredCount = answers.filter((a) => a !== null).length;
  const isUrgent = timeLeft <= 60;

  return (
    <div className="max-w-lg mx-auto">
      {/* Timer and progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${isUrgent ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className={`font-display font-bold text-lg ${isUrgent ? "text-destructive" : "text-foreground"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <span className="text-sm text-muted-foreground font-body">
          Đã trả lời: {answeredCount}/{examQuestions.length}
        </span>
      </div>

      {/* Question navigation dots */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {examQuestions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              i === currentQ
                ? "bg-primary text-primary-foreground shadow-md"
                : answers[i] !== null
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="card-pastel p-8 text-center mb-6"
      >
        <span className="inline-block px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-body mb-4">
          {q.type === "image" ? "Nhận diện ký hiệu" : "Câu hỏi kiến thức"}
        </span>
        <span className="text-7xl block mb-6">{q.emoji}</span>
        <h3 className="text-lg font-display font-bold text-foreground">{q.question}</h3>
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className={`card-pastel p-4 font-body font-semibold text-foreground text-sm transition-all ${
              answers[currentQ] === idx
                ? "border-2 border-primary bg-primary/10"
                : "hover:border-secondary hover:border-2"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="px-5 py-2 rounded-xl border border-border text-foreground font-body text-sm disabled:opacity-40 hover:bg-muted transition-colors"
        >
          ← Trước
        </button>

        {currentQ < examQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="btn-primary-gradient text-sm py-2 px-5"
          >
            Tiếp →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn-primary-gradient text-sm py-2 px-5"
          >
            Nộp bài
          </button>
        )}
      </div>
    </div>
  );
}
