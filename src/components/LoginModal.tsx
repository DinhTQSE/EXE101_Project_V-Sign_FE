import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Mail, X } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { getApiBaseUrl } from "@/services/apiConfig";
import { trackAnalyticsEvent } from "@/services/analytics";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

type AuthMode = "login" | "signup" | "forgot";

const passwordHint = "Tối thiểu 8 ký tự, có chữ hoa và số.";

function isStrongPassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

export function LoginModal({ open, onClose, defaultMode = "signup" }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, requestPasswordReset } = useAuth();

  useEffect(() => {
    setMode(defaultMode);
    setError("");
    setSuccessMessage("");
  }, [defaultMode, open]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMessage("");
  };

  const closeModal = (force = false) => {
    if (loading && !force) return;
    resetForm();
    onClose();
  };

  const validate = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "Vui lòng nhập email.";
    if (mode === "forgot") return "";
    if (!password) return "Vui lòng nhập mật khẩu.";
    if (mode === "signup") {
      if (!name.trim()) return "Vui lòng nhập tên hiển thị.";
      if (!isStrongPassword(password)) return passwordHint;
      if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        await register({ displayName: name.trim(), email, password });
        trackAnalyticsEvent("sign_up", { method: "Email" });
        closeModal(true);
      } else if (mode === "login") {
        await login({ email, password });
        closeModal(true);
      } else {
        await requestPasswordReset(email);
        setSuccessMessage("Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể xử lý yêu cầu. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/auth/google/login-url`);
      if (!response.ok) {
        throw new Error("Không thể kết nối máy chủ Google OAuth2.");
      }
      const payload = await response.json();
      const loginUrl = payload?.data ?? payload;
      if (loginUrl) {
        trackAnalyticsEvent("sign_up", { method: "Google" });
        window.location.href = loginUrl;
      } else {
        throw new Error("Không nhận được liên kết đăng nhập từ Google.");
      }
    } catch (err: unknown) {
      console.error("Google OAuth error:", err);
      const errorObj = err as { message?: string } | null;
      setError(errorObj?.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const title = mode === "signup" ? "Tạo tài khoản" : mode === "login" ? "Đăng nhập" : "Quên mật khẩu";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card-pastel w-full max-w-md p-8 mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tên của bạn</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nhập tên..."
                    className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  required
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                    required
                  />
                  {mode === "signup" && <p className="text-xs text-muted-foreground mt-1">{passwordHint}</p>}
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary-gradient w-full text-center flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <LoadingSpinner size="sm" />}
                {mode === "signup" ? "Đăng ký" : mode === "login" ? "Đăng nhập" : "Gửi hướng dẫn"}
              </button>

              {mode !== "forgot" && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground font-body">Hoặc tiếp tục với</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card text-foreground hover:bg-muted font-body font-semibold text-sm transition-all disabled:opacity-60"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.5 0-6.35-2.85-6.35-6.35s2.85-6.35 6.35-6.35c1.63 0 3.109.619 4.24 1.63L21.2 4.4C19.16 2.51 16.03 1.3 12.24 1.3c-6.07 0-11 4.93-11 11s4.93 11 11 11c5.96 0 10.64-4.27 10.64-10.64 0-.67-.06-1.31-.18-1.93l-10.46.015z"/>
                    </svg>
                    Đăng nhập bằng Google
                  </button>
                </div>
              )}
            </form>

            {mode !== "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccessMessage("");
                }}
                className="block mx-auto mt-3 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Quên mật khẩu?
              </button>
            )}

            <p className="text-center text-sm text-muted-foreground mt-4">
              {mode === "signup" ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-accent font-semibold hover:underline"
              >
                {mode === "signup" ? "Đăng nhập" : "Đăng ký"}
              </button>
            </p>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
