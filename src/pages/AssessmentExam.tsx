import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, Loader2, RotateCcw, XCircle } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/contexts/AuthContext";
import { assessmentApi, AssessmentDetailDto, AssessmentSubmitResultDto } from "@/services/vsignApi";

const DEFAULT_EXAM_TIME_SECONDS = 15 * 60;

export default function AssessmentExam() {
  const { awardQuizXp, profile } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentDetailDto | null>(null);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_EXAM_TIME_SECONDS);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitWarning, setSubmitWarning] = useState(false);
  const [result, setResult] = useState<AssessmentSubmitResultDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const questions = assessment?.questions ?? [];
  const current = questions[currentQuestion];
  const unanswered = useMemo(
    () => questions.filter((question) => !answers[question.id]),
    [answers, questions]
  );

  const loadAssessment = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await assessmentApi.listAssessments();
      if (list.length === 0) {
        setError("Backend chưa có bài thi thử nào.");
        return;
      }
      setAssessment(await assessmentApi.getAssessment(list[0].id));
    } catch {
      setError("Không thể tải bài thi thử từ backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssessment();
  }, []);

  useEffect(() => {
    if (!started || result) return;
    if (timeLeft <= 0) {
      void submitExam(true);
      return;
    }
    const timer = window.setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [result, started, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const submitExam = async (forceSubmit = false) => {
    if (!assessment) return;
    if (!forceSubmit && unanswered.length > 0) {
      setSubmitWarning(true);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const submitResult = await assessmentApi.submitAssessment(
        assessment.id,
        profile.email || "anonymous",
        Object.entries(answers).map(([questionId, selectedAnswerId]) => ({ questionId, selectedAnswerId }))
      );
      setResult(submitResult);
      awardQuizXp(`assessment-${assessment.id}-${Date.now()}`, submitResult.awardedXp, submitResult.passed);
    } catch {
      setError("Không thể nộp bài thi. Kiểm tra backend rồi thử lại.");
    } finally {
      setSubmitting(false);
      setSubmitWarning(false);
    }
  };

  const resetExam = () => {
    setStarted(false);
    setTimeLeft(DEFAULT_EXAM_TIME_SECONDS);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitWarning(false);
    setResult(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
        <p className="font-body text-sm text-muted-foreground">Đang tải bài thi từ backend...</p>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="card-pastel p-6">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground mb-5">{error}</p>
          <button onClick={() => void loadAssessment()} className="btn-primary-gradient inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Tải lại
          </button>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

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
        <h2 className="text-3xl font-display font-bold text-foreground mb-4">{assessment.title}</h2>
        <p className="text-muted-foreground font-body mb-2">
          {assessment.questions.length} câu hỏi · điểm đạt {assessment.passingScore}%
        </p>
        <p className="text-muted-foreground font-body text-sm mb-8">
          Câu hỏi được tải từ backend. Hệ thống tự động nộp bài khi hết giờ.
        </p>
        <button onClick={() => setStarted(true)} className="btn-primary-gradient text-lg px-10 py-3">
          Bắt đầu thi
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        {result.passed ? (
          <CheckCircle className="w-16 h-16 text-[hsl(var(--success))] mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        )}
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          {result.passed ? "Đạt bài thi" : "Chưa đạt"}
        </h2>
        <p className="text-lg text-muted-foreground font-body mb-6">
          {result.correctAnswers}/{result.totalQuestions} câu đúng · {result.score}%
        </p>
        <p className="text-sm text-muted-foreground font-body mb-8">XP nhận được: {result.awardedXp}</p>
        <button onClick={resetExam} className="btn-primary-gradient flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Thi lại
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft <= 60;

  return (
    <div className="max-w-lg mx-auto">
      {submitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="card-pastel max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-display font-bold text-foreground">Còn câu chưa trả lời</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Còn {unanswered.length} câu bỏ trống. Bạn muốn xem lại hay nộp luôn?
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => {
                  const firstUnanswered = questions.findIndex((question) => !answers[question.id]);
                  if (firstUnanswered >= 0) setCurrentQuestion(firstUnanswered);
                  setSubmitWarning(false);
                }}
                className="rounded-2xl border border-border px-4 py-2 text-sm font-body font-semibold text-foreground hover:bg-muted"
              >
                Xem lại
              </button>
              <button onClick={() => void submitExam(true)} className="btn-primary-gradient text-sm py-2 px-4">
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${isUrgent ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className={`font-display font-bold text-lg ${isUrgent ? "text-destructive" : "text-foreground"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <span className="text-sm text-muted-foreground font-body">
          Đã trả lời: {answeredCount}/{questions.length}
        </span>
      </div>

      <div className="flex gap-1.5 mb-6 flex-wrap">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => setCurrentQuestion(index)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              index === currentQuestion
                ? "bg-primary text-primary-foreground shadow-md"
                : answers[question.id]
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {current && (
        <>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-pastel p-8 text-center mb-6"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-body mb-4">
              Câu {currentQuestion + 1}
            </span>
            <h3 className="text-lg font-display font-bold text-foreground">{current.prompt}</h3>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {current.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setAnswers((value) => ({ ...value, [current.id]: option.id }))}
                className={`card-pastel p-4 font-body font-semibold text-foreground text-sm transition-all ${
                  answers[current.id] === option.id
                    ? "border-2 border-primary bg-primary/10"
                    : "hover:border-secondary hover:border-2"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-5 py-2 rounded-xl border border-border text-foreground font-body text-sm disabled:opacity-40 hover:bg-muted transition-colors"
        >
          Trước
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="btn-primary-gradient text-sm py-2 px-5">
            Tiếp
          </button>
        ) : (
          <button
            onClick={() => void submitExam(false)}
            disabled={submitting}
            className="btn-primary-gradient text-sm py-2 px-5 flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Nộp bài
          </button>
        )}
      </div>
    </div>
  );
}
