import { motion } from "framer-motion";
import mascotImg from "@/assets/mascot.png";

interface LoadingSpinnerProps {
  message?: string;
  /** sm: 3 bouncing dots (inline/button) | md: mascot + text (panel) | lg: mascot large + dots (full-page) */
  size?: "sm" | "md" | "lg";
  /** white: for dark/overlay backgrounds */
  color?: "primary" | "white";
}

export function LoadingSpinner({
  message,
  size = "md",
  color = "primary",
}: LoadingSpinnerProps) {
  const dotClass = color === "white" ? "bg-white" : "bg-primary";

  if (size === "sm") {
    return (
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${dotClass} inline-block`}
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div className="flex flex-col items-center gap-3">
        <motion.img
          src={mascotImg}
          alt="Đang tải..."
          className="w-20 h-20 object-contain drop-shadow-lg"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {message && (
          <p className="font-body text-sm text-muted-foreground">{message}</p>
        )}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={`w-2 h-2 rounded-full ${dotClass} inline-block`}
              animate={{ scale: [0.8, 1.4, 0.8] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // md
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.img
        src={mascotImg}
        alt="Đang tải..."
        className="w-12 h-12 object-contain drop-shadow"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {message && (
        <p className="font-body text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
