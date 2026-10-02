import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("vsign_demo_banner_dismissed");
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("vsign_demo_banner_dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative z-50 bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-600/90 text-white px-4 py-2 text-xs md:text-sm font-medium shadow-md backdrop-blur-sm flex items-center justify-between gap-3 border-b border-amber-400/30"
      >
        <div className="flex items-center gap-2 mx-auto text-center font-body">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
          <span>
            🚀 <strong>Demo Mode Active:</strong> Backend cloud instances are temporarily paused post-pilot. You are exploring the fully interactive UI with simulated data.
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-white/20 transition-colors shrink-0 text-white/90 hover:text-white"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
