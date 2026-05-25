import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, Heart, GraduationCap, Clock, UserCheck, Baby, User, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Mascot } from "@/components/Mascot";
import logo from "@/assets/vsign-logo.png";

const steps = [
  {
    title: "Bạn vui lòng cho biết vai trò của mình để V-Sign hỗ trợ tốt nhất nhé?",
    key: "role",
    options: [
      { icon: UserCheck, label: "Người khiếm thính/người điếc" },
      { icon: Briefcase, label: "Người muốn học để giao tiếp, làm việc." },
      { icon: Heart, label: "Người thân/Bạn bè của người khiếm thính." },
      { icon: GraduationCap, label: "Giảng viên/Phiên dịch viên." },
    ],
  },
  {
    title: "Độ tuổi của bạn thuộc nhóm nào dưới đây?",
    key: "ageGroup",
    options: [
      { icon: Baby, label: "Dưới 14 tuổi" },
      { icon: User, label: "14 - 18 tuổi (học sinh)" },
      { icon: Briefcase, label: "18 - 30 tuổi (Sinh viên/Người đi làm)" },
      { icon: UserCog, label: "31 - 50 tuổi (Phụ huynh/Người trung niên)" },
    ],
  },
  {
    title: "Bạn học ngôn ngữ ký hiệu để làm gì?",
    key: "purpose",
    options: [
      { icon: Users, label: "Giao tiếp thường ngày" },
      { icon: Heart, label: "Hỗ trợ người thân" },
      { icon: Briefcase, label: "Phát triển nghề nghiệp" },
      { icon: GraduationCap, label: "Tình nguyện viên" },
    ],
  },
  {
    title: "Mỗi ngày bạn dự định dành bao nhiêu thời gian để luyện tập Ngôn ngữ ký hiệu?",
    key: "dailyTime",
    options: [
      { icon: Clock, label: "10 phút" },
      { icon: Clock, label: "15 phút" },
      { icon: Clock, label: "20 phút" },
      { icon: Clock, label: "30 phút" },
    ],
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const { setHasOnboarded, setOnboardingResponses } = useAuth();
  const navigate = useNavigate();

  const current = steps[step];

  const mascotMessages = [
    "Mình rất vui được gặp bạn! Hãy cho mình biết về bạn nhé! 🎉",
    "Tuyệt vời! Thông tin này giúp mình tạo lộ trình phù hợp cho bạn! 💪",
    "Gần xong rồi! Mục tiêu của bạn là gì? 🎯",
    "Bước cuối! Chọn thời gian phù hợp nhé! ⏰",
  ];

  const handleSkip = () => {
    setOnboardingResponses({
      role: responses.role || "",
      ageGroup: responses.ageGroup || "",
      purpose: responses.purpose || "",
      dailyTime: responses.dailyTime || "10 phút",
    });
    setHasOnboarded(true);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <img
        src={logo}
        alt="V-Sign"
        className="h-10 mb-8 cursor-pointer transition-transform duration-200 hover:scale-105"
        onClick={() => navigate("/")}
      />

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-body">Bước {step + 1} / {steps.length}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <h2 className="text-xl font-display font-bold text-foreground text-center mb-8 leading-relaxed">
            {current.title}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {current.options.map((opt) => (
              <motion.button
                key={opt.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newResponses = { ...responses, [current.key]: opt.label };
                  setResponses(newResponses);
                  if (step < steps.length - 1) {
                    setTimeout(() => setStep(step + 1), 400);
                  }
                }}
                className={`card-pastel p-5 flex items-center gap-4 cursor-pointer transition-all hover:border-primary hover:border-2 ${
                  responses[current.key] === opt.label ? "border-2 border-primary shadow-md" : ""
                }`}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-primary)" }}>
                  <opt.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-semibold text-foreground text-sm text-left">{opt.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="w-full mt-4 text-center text-sm text-muted-foreground font-body hover:text-foreground transition-colors"
          >
            Bỏ qua →
          </button>

          {/* Show finish button on last step */}
          {step === steps.length - 1 && responses[current.key] && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="btn-primary-gradient w-full mt-6 text-center"
              onClick={() => {
                setOnboardingResponses({
                  role: responses.role || "",
                  ageGroup: responses.ageGroup || "",
                  purpose: responses.purpose || "",
                  dailyTime: responses.dailyTime || "10 phút",
                });
                setHasOnboarded(true);
                navigate("/home");
              }}
            >
              Hoàn thành
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      <Mascot message={mascotMessages[step]} />
    </div>
  );
}
