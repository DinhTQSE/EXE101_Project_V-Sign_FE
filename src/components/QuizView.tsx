import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import mascotImg from "@/assets/mascot.png";

interface Question {
  emoji: string;
  question: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
  { emoji: "👋", question: "Đây là ký hiệu của từ nào?", options: ["Xin chào", "Tạm biệt", "Cảm ơn", "Xin lỗi"], correct: 0 },
  { emoji: "🙏", question: "Đây là ký hiệu của từ nào?", options: ["Xin lỗi", "Cảm ơn", "Xin chào", "Giúp đỡ"], correct: 1 },
  { emoji: "🙇", question: "Đây là ký hiệu của từ nào?", options: ["Tạm biệt", "Vâng", "Xin lỗi", "Cảm ơn"], correct: 2 },
  { emoji: "👍", question: "Ký hiệu này có nghĩa là gì?", options: ["Không", "Vâng / Đúng", "Cảm ơn", "Xin chào"], correct: 1 },
  { emoji: "👨‍👩‍👧", question: "Ký hiệu này thuộc chủ đề nào?", options: ["Chào hỏi", "Đồ ăn", "Gia đình", "Trường học"], correct: 2 },
  { emoji: "🍚", question: "Đây là ký hiệu của từ nào?", options: ["Trái cây", "Nước", "Cơm", "Bánh mì"], correct: 2 },
  { emoji: "🔢", question: "Từ 'Năm' biểu diễn bằng mấy ngón tay?", options: ["3 ngón", "4 ngón", "5 ngón", "2 ngón"], correct: 2 },
];

export default function QuizView() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[qIdx];

  const handleAnswer = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      const isCorrect = idx === q.correct;
      if (isCorrect) setScore((s) => s + 1);

      setTimeout(() => {
        if (qIdx < questions.length - 1) {
          setQIdx((i) => i + 1);
          setSelected(null);
        } else {
          setFinished(true);
        }
      }, 1200);
    },
    [selected, q.correct, qIdx]
  );

  if (finished) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl mb-6">
          🎉
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-4">Hoàn thành!</h2>
        <p className="text-muted-foreground font-body text-lg mb-2">
          Bạn đạt <span className="text-primary font-bold">{score}/{questions.length}</span> câu đúng
        </p>
        <img src={mascotImg} alt="" className="w-20 h-20 object-contain mx-auto mb-6" />
        <button
          onClick={() => { setQIdx(0); setSelected(null); setScore(0); setFinished(false); }}
          className="btn-primary-gradient"
        >
          Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-body">
            Câu {qIdx + 1} / {questions.length}
          </span>
          <span className="text-sm font-semibold text-primary font-body">Điểm: {score}</span>
        </div>
        <div className="relative w-full h-3 bg-muted rounded-full overflow-visible">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            initial={{ width: 0 }}
            animate={{ width: `${((qIdx + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <motion.div
        key={qIdx}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="card-pastel p-8 text-center mb-8"
      >
        <span className="text-7xl block mb-6">{q.emoji}</span>
        <h3 className="text-xl font-display font-bold text-foreground">{q.question}</h3>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {q.options.map((opt, idx) => {
          let btnClass = "card-pastel p-4 font-body font-semibold text-foreground cursor-pointer transition-all";

          if (selected !== null) {
            if (idx === q.correct) {
              btnClass += " border-2 border-success bg-success/10 animate-pop";
            } else if (idx === selected && idx !== q.correct) {
              btnClass += " border-2 border-destructive bg-destructive/10 animate-shake";
            }
          } else {
            btnClass += " hover:border-secondary hover:border-2";
          }

          return (
            <motion.button
              key={idx}
              whileHover={selected === null ? { scale: 1.02 } : {}}
              whileTap={selected === null ? { scale: 0.95 } : {}}
              onClick={() => handleAnswer(idx)}
              className={btnClass}
              disabled={selected !== null}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
