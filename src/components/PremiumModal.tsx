import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, QrCode, Loader2, CheckCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { paymentApi, PaymentOrderResponse, PaymentProvider, PaymentTransaction, PlanType, USE_BACKEND } from "@/services/vsignApi";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

type CheckoutState = "selecting" | "qr" | "processing" | "success" | "error";

const providerMeta: Record<PaymentProvider, { label: string; color: string }> = {
  MOMO: { label: "MoMo", color: "bg-pink-100 text-pink-700 border-pink-200" },
  ZALOPAY: { label: "ZaloPay", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

const planMeta: Record<PlanType, { label: string; price: string; saving?: string }> = {
  MONTHLY: { label: "Theo tháng", price: "49.000 VNĐ" },
  YEARLY: { label: "Theo năm", price: "399.000 VNĐ", saving: "Tiết kiệm 32%" },
};

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export default function PremiumModal({ open, onClose }: PremiumModalProps) {
  const { accessToken, setPremium } = useAuth();
  const [planType, setPlanType] = useState<PlanType>("MONTHLY");
  const [provider, setProvider] = useState<PaymentProvider>("MOMO");
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("selecting");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<PaymentOrderResponse | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const benefits = [
    "Mở khóa toàn bộ lộ trình học",
    "Không giới hạn AI Camera luyện tập",
    "Theo dõi XP, streak, badge và bảng xếp hạng đầy đủ",
  ];

  const secondsLeft = useMemo(() => {
    if (!order) return 0;
    return Math.max(0, Math.floor((new Date(order.expiresAt).getTime() - now) / 1000));
  }, [order, now]);

  useEffect(() => {
    if (!open || checkoutState !== "qr") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open, checkoutState]);

  useEffect(() => {
    if (checkoutState === "qr" && order && secondsLeft === 0) {
      setCheckoutState("error");
      setError("Mã QR đã hết hạn. Vui lòng tạo mã mới.");
    }
  }, [checkoutState, order, secondsLeft]);

  const formatQrTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const resetCheckout = () => {
    setCheckoutState("selecting");
    setLoading(false);
    setOrder(null);
    setError("");
    setNow(Date.now());
  };

  const handleClose = () => {
    if (loading) return;
    resetCheckout();
    onClose();
  };

  const createOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const nextOrder = await paymentApi.createOrder({ provider, planType });
      setOrder(nextOrder);
      setNow(Date.now());
      setCheckoutState("qr");
    } catch (err: unknown) {
      setError(errorMessage(err, "Không thể tạo giao dịch thanh toán."));
      setCheckoutState("error");
    } finally {
      setLoading(false);
    }
  };

  const finishPayment = async (status: "SUCCESS" | "FAILED") => {
    if (!order) return;
    setLoading(true);
    setCheckoutState("processing");
    await new Promise((resolve) => setTimeout(resolve, 900));
    let transaction: PaymentTransaction = {
      transactionId: order.transactionId,
      providerTransactionId: order.providerTransactionId,
      provider: order.provider,
      planType: order.planType,
      amount: order.amount,
      currency: order.currency,
      status,
      createdAt: new Date().toISOString(),
    };

    if (USE_BACKEND) {
      try {
        transaction = await paymentApi.getPaymentStatus(order.transactionId, accessToken);
      } catch (err: unknown) {
        setCheckoutState("error");
        setError(errorMessage(err, "Chưa thể xác nhận trạng thái giao dịch. Vui lòng thử lại."));
        setLoading(false);
        return;
      }
    } else {
      await paymentApi.recordPayment(transaction);
    }

    if (transaction.status === "SUCCESS") {
      setPremium(true, transaction);
      setCheckoutState("success");
      setError("");
    } else if (transaction.status === "PENDING") {
      setCheckoutState("qr");
      setError("Giao dịch vẫn đang chờ xác nhận. Vui lòng thử lại sau khi thanh toán.");
    } else {
      setCheckoutState("error");
      setError("Thanh toán không thành công. Bạn có thể tạo mã mới hoặc đổi ví thanh toán.");
    }
    setLoading(false);
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
            onClick={e => e.stopPropagation()}
          >
            {checkoutState === "success" ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <CheckCircle className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Thanh toán thành công!</h2>
                <p className="text-muted-foreground font-body mb-2">Premium đã được kích hoạt trên phiên hiện tại.</p>
                {order && <p className="text-xs text-muted-foreground font-body mb-8">Mã giao dịch: {order.providerTransactionId}</p>}
                <button onClick={handleClose} className="btn-primary-gradient w-full text-center min-h-[48px]">
                  Bắt đầu học ngay
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">Nâng cấp V-Sign Premium</h2>
                    <p className="text-xs text-muted-foreground mt-1">QR payment contract-ready cho MoMo/ZaloPay</p>
                  </div>
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(planMeta) as PlanType[]).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setPlanType(plan)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          planType === plan ? "border-primary bg-primary/10" : "border-border bg-card"
                        }`}
                      >
                        <span className="block text-sm font-display font-bold text-foreground">{planMeta[plan].label}</span>
                        <span className="block text-lg font-display font-bold text-primary mt-1">{planMeta[plan].price}</span>
                        {planMeta[plan].saving && <span className="text-xs text-secondary font-semibold">{planMeta[plan].saving}</span>}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {benefits.map(b => (
                      <div key={b} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--gradient-primary)" }}>
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                        <span className="font-body text-sm text-foreground">{b}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="font-display font-bold text-foreground text-sm mb-3">Chọn ví thanh toán</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(providerMeta) as PaymentProvider[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => setProvider(p)}
                          className={`rounded-2xl border p-4 flex items-center gap-3 text-left transition-all ${
                            provider === p ? "border-primary bg-primary/10" : "border-border bg-card"
                          }`}
                        >
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${providerMeta[p].color}`}>{providerMeta[p].label}</span>
                          <span className="text-xs text-muted-foreground">QR/deep link</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {checkoutState === "qr" && order && (
                    <div className="rounded-2xl border border-primary/30 bg-card p-4 text-center">
                      <div className="inline-flex items-center gap-2 text-sm font-display font-bold text-foreground mb-3">
                        <QrCode className="w-4 h-4 text-primary" /> Quét mã {providerMeta[order.provider].label}
                      </div>
                      <div className="rounded-xl p-4 bg-white shadow-sm inline-block">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(order.qrCodeData)}`}
                          alt={`${order.provider} QR`}
                          className="w-44 h-44"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-body mt-3">
                        {order.amount.toLocaleString("vi-VN")} VNĐ · Hết hạn sau <span className="font-bold text-primary">{formatQrTime(secondsLeft)}</span>
                      </p>
                      <div className={`grid gap-2 mt-4 ${USE_BACKEND ? "grid-cols-1" : "grid-cols-2"}`}>
                        <button onClick={() => finishPayment("SUCCESS")} disabled={loading} className="btn-primary-gradient text-sm py-2">
                          {USE_BACKEND ? "Kiểm tra thanh toán" : "Tôi đã thanh toán"}
                        </button>
                        {!USE_BACKEND && (
                          <button
                            onClick={() => finishPayment("FAILED")}
                            disabled={loading}
                            className="rounded-2xl border border-border px-4 py-2 text-sm font-body font-semibold text-foreground hover:bg-muted"
                          >
                            Mô phỏng lỗi
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {checkoutState === "processing" && (
                    <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang xác nhận trạng thái giao dịch...
                    </div>
                  )}

                  {checkoutState === "error" && error && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                      <div className="flex items-start gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                      <button
                        onClick={resetCheckout}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-body font-semibold text-foreground hover:text-primary"
                      >
                        <RefreshCcw className="w-4 h-4" /> Tạo lại mã hoặc đổi ví
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-border">
                  <button
                    onClick={createOrder}
                    disabled={loading || checkoutState === "qr" || checkoutState === "processing"}
                    className="btn-primary-gradient w-full text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {loading && checkoutState === "selecting" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Đang tạo mã...
                      </>
                    ) : checkoutState === "qr" ? (
                      "Đang chờ thanh toán"
                    ) : (
                      `Tạo mã ${providerMeta[provider].label}`
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
