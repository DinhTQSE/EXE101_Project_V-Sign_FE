import { motion, AnimatePresence } from "framer-motion";
import mascotImg from "@/assets/mascot.png";
import { useEffect, useState } from "react";

export type MascotState = "idle" | "wave" | "correct" | "incorrect" | "complete";

interface MascotProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  state?: MascotState;
}

const stateAnimations: Record<MascotState, { animate: object; transition: object }> = {
  idle: {
    animate: { y: [0, -6, 0] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  wave: {
    animate: { rotate: [0, 14, -14, 14, 0], scale: [1, 1.1, 1] },
    transition: { duration: 1.2, ease: "easeInOut" },
  },
  correct: {
    animate: { y: [0, -18, 0], scale: [1, 1.2, 1] },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  incorrect: {
    animate: { x: [0, -6, 6, -6, 6, 0], rotate: [0, -5, 5, -5, 5, 0] },
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  complete: {
    animate: { y: [0, -22, 0, -14, 0], scale: [1, 1.25, 1, 1.15, 1] },
    transition: { duration: 1, ease: "easeOut" },
  },
};

const stateEmojis: Record<MascotState, string> = {
  idle: "😊",
  wave: "👋",
  correct: "👍",
  incorrect: "🤔",
  complete: "👏",
};

export function Mascot({ message, className = "", size = "md", state = "idle" }: MascotProps) {
  const sizeClass = size === "sm" ? "w-14 h-14" : size === "lg" ? "w-28 h-28" : "w-20 h-20";
  const [currentState, setCurrentState] = useState<MascotState>(state);

  useEffect(() => {
    setCurrentState(state);
    if (state !== "idle") {
      const timeout = setTimeout(() => setCurrentState("idle"), state === "complete" ? 2500 : 1500);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  const anim = stateAnimations[currentState];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 ${className}`}>
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="speech-bubble max-w-[240px] text-sm font-body flex items-start gap-1.5"
          >
            <span className="text-base shrink-0">{stateEmojis[currentState]}</span>
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.img
        key={currentState}
        src={mascotImg}
        alt="V-Sign Mascot"
        className={`${sizeClass} object-contain drop-shadow-lg cursor-pointer`}
        animate={anim.animate as any}
        transition={anim.transition as any}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      />
    </div>
  );
}
