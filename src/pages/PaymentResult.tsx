import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, Home } from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/contexts/AuthContext";

export const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedStatus, setResolvedStatus] = useState<string>("PENDING");

  const isCancelRoute = location.pathname.includes("/payment/cancel") || searchParams.get("cancel") === "true";

  useEffect(() => {
    const syncPayment = async () => {
      try {
        const orderCode = searchParams.get("orderCode");
        const status = searchParams.get("status") || (isCancelRoute ? "CANCELLED" : "PENDING");
        const cancel = searchParams.get("cancel") === "true" || isCancelRoute;

        if (!orderCode) {
          // If we don't have orderCode, we might have landed here directly or it's a cancelled session without code.
          if (isCancelRoute) {
            setResolvedStatus("CANCELLED");
            setLoading(false);
          } else {
            setError("Không tìm thấy thông tin mã đơn hàng thanh toán.");
            setLoading(false);
          }
          return;
        }

        // Send payload to backend to verify redirection status
        const res = await paymentService.syncReturnStatus({
          orderCode: parseInt(orderCode, 10),
          status,
          cancel,
        });

        setResolvedStatus(res.resolvedStatus);

        // If payment is successfully verified as PAID, refresh profile
        if (res.resolvedStatus === "PAID") {
          await refreshUser();
        }
      } catch (err: unknown) {
        console.error("Error syncing payment status:", err);
        const errorObj = err as { message?: string } | null;
        setError(errorObj?.message || "Không thể đồng bộ trạng thái thanh toán với máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    syncPayment();
  }, [searchParams, location.pathname, isCancelRoute, refreshUser]);

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { type: "spring", stiffness: 200, delay: 0.2 }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <h3 className="text-xl font-display font-bold text-foreground">Đang xác thực giao dịch...</h3>
          <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
            Chúng tôi đang kiểm tra kết quả giao dịch thanh toán từ PayOS. Vui lòng chờ trong giây lát.
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-[70vh] flex items-center justify-center p-6 bg-background">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card-pastel max-w-md w-full p-8 text-center space-y-6 shadow-xl border border-destructive/20"
        >
          <motion.div variants={iconVariants} className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
            <AlertCircle className="w-8 h-8" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-destructive text-2xl font-display font-bold">Lỗi Xác Thực</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">{error}</p>
          </div>

          <div className="pt-2 space-y-2">
            <button 
              onClick={() => navigate("/courses")} 
              className="btn-primary-gradient w-full min-h-[48px] flex items-center justify-center gap-2"
            >
              Thử lại / Xem các khoá học
            </button>
            <button 
              onClick={() => navigate("/home")} 
              className="w-full py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-body font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Quay về Trang chủ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isSuccess = resolvedStatus === "PAID";
  const isCancelled = resolvedStatus === "CANCELLED" || isCancelRoute;

  return (
    <div className="flex-1 min-h-[70vh] flex items-center justify-center p-6 bg-background">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="card-pastel max-w-md w-full p-8 text-center space-y-6 shadow-xl border border-border"
      >
        {isSuccess ? (
          <>
            <motion.div 
              variants={iconVariants} 
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-primary-foreground shadow-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-foreground text-2xl font-display font-bold">Thanh Toán Thành Công!</h2>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Tài khoản của bạn đã được nâng cấp lên gói <span className="font-bold text-primary">Premium</span>. Hãy bắt đầu trải nghiệm toàn bộ tính năng và lộ trình học tập không giới hạn ngay hôm nay!
              </p>
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-left space-y-1.5 text-xs font-body text-muted-foreground">
              <div className="flex justify-between">
                <span>Mã đơn hàng:</span>
                <span className="font-bold text-foreground">#{searchParams.get("orderCode") || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className="font-bold text-[hsl(var(--success))]">Đã thanh toán</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button 
                onClick={() => navigate("/courses")} 
                className="btn-primary-gradient w-full min-h-[48px] flex items-center justify-center gap-2 group"
              >
                Bắt đầu học ngay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </>
        ) : isCancelled ? (
          <>
            <motion.div 
              variants={iconVariants} 
              className="w-20 h-20 bg-amber-100 rounded-full mx-auto flex items-center justify-center text-amber-600 shadow-sm"
            >
              <XCircle className="w-10 h-10" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-amber-700 text-2xl font-display font-bold">Đã Huỷ Thanh Toán</h2>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Giao dịch của bạn đã được huỷ bỏ thành công. Tài khoản chưa phát sinh chi phí nào.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button 
                onClick={() => navigate("/courses")} 
                className="btn-primary-gradient w-full min-h-[48px] flex items-center justify-center gap-2"
              >
                Quay lại Khoá học
              </button>
              <button 
                onClick={() => navigate("/home")} 
                className="w-full py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-body font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Về Trang chủ
              </button>
            </div>
          </>
        ) : (
          <>
            <motion.div 
              variants={iconVariants} 
              className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center text-muted-foreground shadow-sm animate-pulse"
            >
              <AlertCircle className="w-10 h-10" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-foreground text-2xl font-display font-bold">Chưa Xác Nhận</h2>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Giao dịch của bạn đang trong trạng thái chờ hoặc chưa được giải quyết. Vui lòng kiểm tra lại.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button 
                onClick={() => navigate("/courses")} 
                className="btn-primary-gradient w-full min-h-[48px]"
              >
                Quay lại Khoá học
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentResult;
