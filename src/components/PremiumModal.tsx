import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CreditCard, QrCode, Wallet, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

type PaymentMethod = "ewallet" | "card" | "qr" | null;

export default function PremiumModal({ open, onClose }: PremiumModalProps) {
  const { setPremium } = useAuth();
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(600);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    if (method !== "qr" || success || loading) return;
    if (qrCountdown <= 0) return;
    const t = setInterval(() => setQrCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [method, success, loading, qrCountdown]);

  const formatQrTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setPremium(true);
    }, 2000);
  };

  const handleClose = () => {
    if (!loading) {
      setMethod(null);
      setLoading(false);
      setSuccess(false);
      setQrCountdown(600);
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");
      onClose();
    }
  };

  const benefits = [
    "Mở khóa toàn bộ lộ trình học",
    "Không giới hạn AI Camera luyện tập",
    "Tham gia thử thách nhóm và nhận chứng chỉ",
  ];

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
            {success ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}
                >
                  <CheckCircle className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Thanh toán thành công!
                </h2>
                <p className="text-muted-foreground font-body mb-8">
                  Chào mừng bạn đến với V-Sign Premium.
                </p>
                <button onClick={handleClose} className="btn-primary-gradient w-full text-center min-h-[48px]">
                  Bắt đầu học ngay
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-display font-bold text-foreground">Nâng cấp V-Sign Premium</h2>
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-display font-bold text-primary"><span className="text-4xl font-display font-bold text-primary">49.000 VNĐ</span></span>
                    <span className="text-muted-foreground font-body"> / tháng</span>
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
                    <p className="font-display font-bold text-foreground text-sm mb-3">Chọn phương thức thanh toán</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setMethod("ewallet")}
                        className={`w-full card-pastel p-4 flex items-center gap-3 text-left transition-all min-h-[56px] ${
                          method === "ewallet" ? "border-2 border-primary" : ""
                        }`}
                      >
                        <Wallet className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1">
                          <span className="font-body font-semibold text-sm text-foreground">Ví điện tử</span>
                          <p className="text-xs text-muted-foreground">MoMo · ZaloPay</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${method === "ewallet" ? "border-primary bg-primary" : "border-border"} flex items-center justify-center`}>
                          {method === "ewallet" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                        </div>
                      </button>

                      <div>
                        <button
                          onClick={() => setMethod("card")}
                          className={`w-full card-pastel p-4 flex items-center gap-3 text-left transition-all min-h-[56px] ${
                            method === "card" ? "border-2 border-primary rounded-b-none" : ""
                          }`}
                        >
                          <CreditCard className="w-5 h-5 text-primary shrink-0" />
                          <div className="flex-1">
                            <span className="font-body font-semibold text-sm text-foreground">Thẻ Ngân hàng / Thẻ Tín dụng</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${method === "card" ? "border-primary bg-primary" : "border-border"} flex items-center justify-center`}>
                            {method === "card" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {method === "card" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-2 border-t-0 border-primary rounded-b-2xl bg-card"
                            >
                              <div className="p-4 space-y-3">
                                <input type="text" placeholder="Số thẻ" value={cardNumber}
                                  onChange={e => setCardNumber(e.target.value)}
                                  className="w-full px-3 py-3 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px]" />
                                <input type="text" placeholder="Tên chủ thẻ" value={cardName}
                                  onChange={e => setCardName(e.target.value)}
                                  className="w-full px-3 py-3 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px]" />
                                <div className="grid grid-cols-2 gap-3">
                                  <input type="text" placeholder="Ngày hết hạn" value={cardExpiry}
                                    onChange={e => setCardExpiry(e.target.value)}
                                    className="w-full px-3 py-3 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px]" />
                                  <input type="text" placeholder="CVV" value={cardCvv}
                                    onChange={e => setCardCvv(e.target.value)}
                                    className="w-full px-3 py-3 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px]" />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <button
                          onClick={() => setMethod("qr")}
                          className={`w-full card-pastel p-4 flex items-center gap-3 text-left transition-all min-h-[56px] ${
                            method === "qr" ? "border-2 border-primary rounded-b-none" : ""
                          }`}
                        >
                          <QrCode className="w-5 h-5 text-primary shrink-0" />
                          <div className="flex-1">
                            <span className="font-body font-semibold text-sm text-foreground">Chuyển khoản VietQR</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${method === "qr" ? "border-primary bg-primary" : "border-border"} flex items-center justify-center`}>
                            {method === "qr" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {method === "qr" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-2 border-t-0 border-primary rounded-b-2xl bg-card"
                            >
                              <div className="p-4 flex flex-col items-center">
                                <div className="rounded-xl p-4 bg-white shadow-sm">
                                  <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Thanh_toan_VSign_Premium_49000"
                                    alt="VietQR"
                                    className="w-40 h-40"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground font-body mt-3 mb-2"><p className="text-xs text-muted-foreground font-body mt-3 mb-2">Quét mã để thanh toán 49.000 VNĐ</p></p>
                                <span className="text-sm font-display font-bold text-primary">{formatQrTime(qrCountdown)}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-border">
                  <button
                    onClick={handlePay}
                    disabled={!method || loading}
                    className="btn-primary-gradient w-full text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : method === "qr" ? (
                      "Đã chuyển khoản"
                    ) : (
                      "Thanh toán 49.000 VNĐ"
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
