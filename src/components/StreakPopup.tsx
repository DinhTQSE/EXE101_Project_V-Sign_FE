import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function todayKey() {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default function StreakPopup() {
  const { stats } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!stats.streakChangedToday || stats.streak < 1) return;
    const key = `vsign_streak_popup_${todayKey()}`;
    if (localStorage.getItem(key)) return;
    // Delay slightly so it doesn't flash on initial render
    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(key, "1");
    }, 1200);
    return () => clearTimeout(timer);
  }, [stats.streakChangedToday, stats.streak]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setVisible(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-card rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setVisible(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-muted transition-colors z-10"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Glow background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: "radial-gradient(circle at 50% 30%, hsl(14 68% 62%), transparent 70%)",
              }}
            />

            <div className="relative p-8 text-center">
              {/* Fire icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Flame className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              {/* Sparkle decorations */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-12 left-8"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute top-16 right-10"
              >
                <Sparkles className="w-4 h-4 text-primary/60" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display font-bold text-2xl text-foreground mb-2"
              >
                🔥 Streak {stats.streak} ngày!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-body text-muted-foreground text-sm mb-2"
              >
                Bạn đã giữ chuỗi học {stats.streak} ngày liên tiếp. Tiếp tục phát huy nhé!
              </motion.p>

              {stats.xp > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="font-body text-xs text-primary font-bold mb-6"
                >
                  Tổng XP: {stats.xp}
                </motion.p>
              )}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  setVisible(false);
                  navigate("/courses");
                }}
                className="btn-primary-gradient flex items-center gap-2 mx-auto"
              >
                Tiếp tục học <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
