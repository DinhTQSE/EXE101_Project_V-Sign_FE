import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export function LoginModal({ open, onClose, defaultMode = "signup" }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(defaultMode === "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { login } = useAuth();

  useEffect(() => {
    setIsSignUp(defaultMode === "signup");
  }, [defaultMode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(name || "Người học mới", isSignUp);
    onClose();
    setName("");
    setEmail("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card-pastel w-full max-w-md p-8 mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {isSignUp ? "Tạo tài khoản" : "Đăng nhập"}
              </h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tên của bạn</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Nhập tên..."
                    className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mật khẩu</label>
                <input
                  type="password" placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  required
                />
              </div>
              <button type="submit" className="btn-primary-gradient w-full text-center">
                {isSignUp ? "Đăng ký" : "Đăng nhập"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isSignUp ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-accent font-semibold hover:underline">
                {isSignUp ? "Đăng nhập" : "Đăng ký"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
