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
  const { accessToken, subscription } = useAuth();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [fetchingTiers, setFetchingTiers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);

  const benefits = [
    "Mở khóa toàn bộ lộ trình học và từ vựng",
    "AI Camera luyện tập theo gói đăng ký",
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
    setShowUpgradeConfirm(false);
    onClose();
  };

  const handleCheckout = async () => {
    if (!selectedTierId) return;

    const selectedTier = tiers.find((t) => t.tierId === selectedTierId);
    const isUpgrading =
      subscription?.status === "ACTIVE" &&
      subscription?.planType === "MONTHLY" &&
      selectedTier?.title.toLowerCase() === "pro";

    if (isUpgrading && !showUpgradeConfirm) {
      setShowUpgradeConfirm(true);
      return;
    }

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
      if (errorObj?.message?.includes("active paid")) {
        setError("Tài khoản của bạn đang có một gói Premium hoạt động! Không thể mua gói mới khi gói cũ chưa hết hạn.");
      } else if (errorObj?.code === "HTTP_ERROR") {
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
              {showUpgradeConfirm ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-amber-500">
                    <AlertCircle className="w-8 h-8 shrink-0 animate-pulse" />
                    <h3 className="text-lg font-display font-bold">Xác nhận nâng cấp gói</h3>
                  </div>
                  <p className="text-sm text-foreground/80 font-body leading-relaxed">
                    Tài khoản của bạn hiện đang có gói **V-Sign Plus** hoạt động.
                  </p>
                  <p className="text-sm text-foreground/80 font-body leading-relaxed bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                    <strong>Lưu ý:</strong> Khi bạn đồng ý nâng cấp lên gói **V-Sign Pro**, gói Plus cũ sẽ bị <strong>hủy bỏ hoàn toàn</strong> ngay khi thanh toán thành công (mặc dù vẫn còn lượt sử dụng AI hoặc thời gian sử dụng). Bạn có đồng ý hủy gói cũ để nâng cấp không?
                  </p>
                  {error && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                      <div className="flex items-start gap-2 text-sm text-destructive font-body">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : fetchingTiers ? (
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
                            {`${tier.limitedToken} lượt hỏi AI / tháng`}
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
                {showUpgradeConfirm ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUpgradeConfirm(false)}
                      disabled={loading}
                      className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={loading}
                      className="btn-primary-gradient w-full sm:w-1/2 text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] font-display font-bold text-sm"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" /> Đang kết nối PayOS...
                        </>
                      ) : (
                        "Đồng ý & Thanh toán"
                      )}
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
