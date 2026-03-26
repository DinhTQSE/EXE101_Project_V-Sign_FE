import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import mascotImg from "@/assets/mascot.png";
import WebcamFeed from "@/components/WebcamFeed";

export default function PracticeView() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<"success" | "fail" | null>(null);

  const checkSign = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      const isCorrect = Math.random() > 0.3;
      setResult(isCorrect ? "success" : "fail");
      if (isCorrect) {
        toast.success("Tuyệt vời! Bạn đã ra hiệu đúng từ 'CẢM ƠN'! 🎉");
      } else {
        toast.error("Chưa chính xác, hãy thử lại nhé! 💪");
      }
    }, 3000);
  }, [scanning]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-display font-bold text-foreground text-center mb-2">
        AI Luyện Tập Mode
      </h2>
      <p className="text-center text-muted-foreground font-body mb-8">
        Thực hiện ký hiệu trước camera để AI kiểm tra
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Left: Word card */}
        <div className="card-pastel p-6 flex flex-col items-center justify-center">
          <div className="coral-box w-full mb-4">CẢM ƠN</div>
          <span className="text-7xl mb-4">🙏</span>
          <p className="text-sm text-muted-foreground font-body text-center">
            Thực hiện ký hiệu này trước camera
          </p>
        </div>

        {/* Right: Camera */}
        <div className="relative">
          <WebcamFeed glowOnActive />

          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 backdrop-blur-sm rounded-2xl">
              <motion.div
                className="w-40 h-40 border-4 border-secondary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                <span className="text-white font-display font-bold mt-2 text-sm">Đang phân tích...</span>
              </div>
            </div>
          )}
          {result === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--success))]/20 backdrop-blur-sm rounded-2xl"
            >
              <div className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-[hsl(var(--success))]" />
                <span className="font-display font-bold text-[hsl(var(--success))] text-xl mt-2">CHÍNH XÁC!</span>
                <img src={mascotImg} alt="" className="w-16 h-16 object-contain mt-2" />
              </div>
            </motion.div>
          )}
          {result === "fail" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-destructive/20 backdrop-blur-sm rounded-2xl"
            >
              <div className="flex flex-col items-center">
                <XCircle className="w-16 h-16 text-destructive" />
                <span className="font-display font-bold text-destructive text-xl mt-2">THỬ LẠI</span>
                <img src={mascotImg} alt="" className="w-12 h-12 object-contain mt-2 opacity-70" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={checkSign}
          disabled={scanning}
          className="btn-primary-gradient flex items-center gap-2 disabled:opacity-50"
        >
          Check Ký hiệu
        </button>
      </div>
    </div>
  );
}
