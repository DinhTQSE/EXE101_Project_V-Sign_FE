import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { authApi } from "@/services/vsignApi";
import { toast } from "sonner";
import logo from "@/assets/vsign-logo.png";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Mật khẩu tối thiểu cần 8 ký tự.";
    if (!/[A-Z]/.test(pwd)) return "Mật khẩu phải chứa ít nhất một chữ viết hoa.";
    if (!/\d/.test(pwd)) return "Mật khẩu phải chứa ít nhất một chữ số.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Mã bảo mật khôi phục mật khẩu (Token) không tồn tại hoặc không hợp lệ.");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await authApi.completePasswordReset({
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
      toast.success("Mật khẩu của bạn đã được cập nhật thành công.");
    } catch (err: unknown) {
      console.error("Reset password failed:", err);
      const errorObj = err as { code?: string; message?: string } | null;
      if (errorObj?.code === "TOKEN_EXPIRED") {
        setError("Đường dẫn khôi phục mật khẩu đã hết hạn (tối đa 15 phút). Vui lòng yêu cầu lại mã mới.");
      } else if (errorObj?.code === "INVALID_TOKEN") {
        setError("Mã khôi phục không hợp lệ hoặc đã được sử dụng trước đó.");
      } else {
        setError(errorObj?.message || "Đã xảy ra lỗi trong quá trình đặt lại mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6" style={{ background: "var(--gradient-hero)" }}>
      <div className="mb-6 flex flex-col items-center">
        <img src={logo} alt="V-Sign Logo" className="h-16 mb-2 cursor-pointer" onClick={() => navigate("/")} />
        <h1 className="text-xl font-display font-bold text-foreground">Học Ngôn Ngữ Ký Hiệu Việt Nam</h1>
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="card-pastel max-w-md w-full p-8 shadow-xl border border-border"
      >
        {success ? (
          <div className="text-center space-y-6">
            <div 
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-primary-foreground shadow-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-foreground text-2xl font-display font-bold">Đặt Lại Thành Công!</h2>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Mật khẩu tài khoản V-Sign của bạn đã được cập nhật thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới này.
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => navigate("/", { state: { authMode: "login" } })} 
                className="btn-primary-gradient w-full min-h-[48px] flex items-center justify-center gap-2 group"
              >
                Đăng nhập ngay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <KeyRound className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">Khôi phục mật khẩu</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Vui lòng nhập mật khẩu mới bảo mật của bạn.</p>
              </div>
            </div>

            {!token ? (
              <div className="space-y-6 text-center">
                <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Mã bảo mật khôi phục mật khẩu (Token) bị thiếu trên đường dẫn. Vui lòng kiểm tra lại Email của bạn.</span>
                </div>
                <button 
                  onClick={() => navigate("/", { state: { authMode: "login" } })} 
                  className="w-full py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-body font-semibold text-sm transition-colors"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full pl-4 pr-10 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body">Tối thiểu 8 ký tự, có chữ hoa và chữ số.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">Xác nhận mật khẩu</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu..."
                    className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary-gradient w-full min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-60 font-display"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...
                      </>
                    ) : (
                      "Đặt lại mật khẩu"
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate("/", { state: { authMode: "login" } })} 
                    className="w-full py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-body font-semibold text-sm transition-colors flex items-center justify-center"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
