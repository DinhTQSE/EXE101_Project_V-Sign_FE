import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Crown, CreditCard } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { paymentService, SubscriptionTier } from "@/services/paymentService";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PremiumModal({ open, onClose }: PremiumModalProps) {
  const { accessToken } = useAuth();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [fetchingTiers, setFetchingTiers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const benefits = [
    "Mở khóa toàn bộ lộ trình học và từ vựng",
    "Không giới hạn AI Camera luyện tập",
    "Theo dõi XP, streak, badge và bảng xếp hạng đầy đủ",
  ];

  useEffect(() => {
    if (!open) return;
    const loadTiers = async () => {
      try {
        setFetchingTiers(true);
        setError("");
        const data = await paymentService.getTiers();
        const activeTiers = data.filter((t) => t.isActive);
        setTiers(activeTiers);
        if (activeTiers.length > 0) {
          setSelectedTierId(activeTiers[0].tierId);
        }
      } catch (err: unknown) {
        console.error("Failed to load tiers:", err);
        setError("Không thể tải thông tin các gói Premium. Vui lòng thử lại sau.");
      } finally {
        setFetchingTiers(false);
      }
    };
    loadTiers();
  }, [open]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleCheckout = async () => {
    if (!selectedTierId) return;
    setLoading(true);
    setError("");
    try {
      const res = await paymentService.createCheckout(selectedTierId, accessToken);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("Không nhận được liên kết thanh toán từ máy chủ.");
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      const errorObj = err as { code?: string; message?: string } | null;
      if (errorObj?.code === "HTTP_ERROR" || errorObj?.message?.includes("active paid")) {
        setError(errorObj?.message || "Bạn đang có một gói Premium hoạt động!");
      } else {
        setError(errorObj?.message || "Không thể tạo giao dịch thanh toán. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getTierDisplayTitle = (title: string) => {
    switch (title.toLowerCase()) {
      case "plus": return "V-Sign Plus";
      case "pro": return "V-Sign Pro";
      default: return title.toUpperCase();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-foreground/30 backdrop-blur-sm p-0 md:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="card-pastel w-full md:max-w-lg max-h-[100vh] md:max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 animate-pulse" />
                <h2 className="text-xl font-display font-bold text-foreground">Nâng cấp V-Sign Premium</h2>
              </div>
              <button 
                onClick={handleClose} 
                disabled={loading}
                className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {fetchingTiers ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-muted-foreground font-body">Đang tải các gói dịch vụ...</p>
                </div>
              ) : error && tiers.length === 0 ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-destructive font-body">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tiers.map((tier) => {
                      const isSelected = selectedTierId === tier.tierId;
                      return (
                        <button
                          key={tier.tierId}
                          type="button"
                          onClick={() => setSelectedTierId(tier.tierId)}
                          className={`rounded-2xl border p-5 text-left transition-all ${
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          <span className="block text-sm font-display font-bold text-foreground">
                            {getTierDisplayTitle(tier.title)}
                          </span>
                          <span className="block text-xl font-display font-bold text-primary mt-2">
                            {tier.amount.toLocaleString("vi-VN")} VNĐ
                          </span>
                          <span className="block text-xs text-muted-foreground font-body mt-1.5">
                            Sử dụng trong {tier.noMonth} tháng
                          </span>
                          <span className="inline-block text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full mt-3">
                            {tier.limitedToken >= 500 
                              ? "Không giới hạn AI Camera" 
                              : `${tier.limitedToken} lượt hỏi AI / tháng`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3 pt-2">
                    {benefits.map((b) => (
                      <div key={b} className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" 
                          style={{ background: "var(--gradient-primary)" }}
                        >
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                        <span className="font-body text-sm text-foreground">{b}</span>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                      <div className="flex items-start gap-2 text-sm text-destructive font-body">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 text-center">
                    <p className="text-xs text-muted-foreground font-body flex items-center justify-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Thanh toán trực tuyến an toàn qua cổng PayOS
                    </p>
                  </div>
                </>
              )}
            </div>

            {!fetchingTiers && tiers.length > 0 && (
              <div className="p-6 border-t border-border">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn-primary-gradient w-full text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] font-display font-bold"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" /> Đang kết nối PayOS...
                    </>
                  ) : (
                    "Thanh toán ngay"
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
