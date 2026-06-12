import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Flame, BookOpen, Clock, TrendingUp, Pencil, Camera, Save, X, Crown, Bell, KeyRound, WalletCards, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import mascotImg from "@/assets/mascot.png";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

const weeklyData = [
  { day: "T2", minutes: 15 },
  { day: "T3", minutes: 25 },
  { day: "T4", minutes: 10 },
  { day: "T5", minutes: 30 },
  { day: "T6", minutes: 20 },
  { day: "T7", minutes: 0 },
  { day: "CN", minutes: 5 },
];

const chartConfig = {
  minutes: { label: "Phút học", color: "hsl(14 68% 62%)" },
};

type Stats = ReturnType<typeof useAuth>["stats"];

const BADGES = [
  { emoji: "🏆", name: "Chiến thần VSL", desc: "Hoàn thành 50 bài", unlockFn: (s: Stats) => s.completedLessons.length >= 50 },
  { emoji: "🦉", name: "Cú đêm", desc: "Học sau 10 giờ tối", unlockFn: () => true },
  { emoji: "🔥", name: "Streak 7 ngày", desc: "7 ngày liên tiếp", unlockFn: (s: Stats) => s.streak >= 7 },
  { emoji: "⭐", name: "Ngôi sao mới", desc: "Bài học đầu tiên", unlockFn: (s: Stats) => s.completedLessons.length >= 1 },
  { emoji: "💎", name: "Kim cương", desc: "Đạt 1000 XP", unlockFn: (s: Stats) => s.xp >= 1000 },
  { emoji: "🎯", name: "Bách phát bách trúng", desc: "Điểm tuyệt đối", unlockFn: (s: Stats) => s.perfectQuizCount >= 1 },
];

export default function Profile() {
  const {
    userName, stats, profile, updateProfile, isPremium, changePassword,
    subscription, paymentHistory, reminderEnabled, setReminderEnabled,
    reminderTime, setReminderTime,
  } = useAuth();
  const { streak, longestStreak, completedLessons, totalMinutes, xp, perfectQuizCount } = stats;

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.displayName || userName);
  const [editBio, setEditBio] = useState(profile.bio);
  const [previewAvatar, setPreviewAvatar] = useState(profile.avatarUrl);
  const [profileMessage, setProfileMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setProfileMessage("Ảnh đại diện chỉ hỗ trợ JPG/PNG và tối đa 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editName.trim()) { setProfileMessage("Tên hiển thị không được để trống."); return; }
    await updateProfile({ displayName: editName.trim(), bio: editBio, avatarUrl: previewAvatar });
    setProfileMessage("Đã lưu hồ sơ."); setEditing(false);
  };

  const handleCancel = () => {
    setEditName(profile.displayName || userName); setEditBio(profile.bio);
    setPreviewAvatar(profile.avatarUrl); setProfileMessage(""); setEditing(false);
  };

  const handleChangePassword = async () => {
    setSecurityError(""); setSecurityMessage("");
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setSecurityError("Mật khẩu mới cần tối thiểu 8 ký tự, có chữ hoa và số."); return;
    }
    if (newPassword !== confirmPassword) { setSecurityError("Mật khẩu xác nhận không khớp."); return; }
    try {
      await changePassword(currentPassword, newPassword);
      setSecurityMessage("Đã đổi mật khẩu thành công.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setSecurityError(err?.message || "Không thể đổi mật khẩu.");
    }
  };

  const displayName = profile.displayName || userName || "Người học mới";
  const avatarSrc = editing ? previewAvatar : profile.avatarUrl;

  /* ── input class shared ── */
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    /* flex-1 + min-h-0 claim the full height propagated by DashboardLayout */
    <div className="flex-1 min-h-0 w-full flex flex-col gap-3">

      {/* ── 3-column bento grid that fills all remaining height ── */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* Profile card */}
          <div className="card-pastel p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  onClick={() => editing && fileRef.current?.click()}
                  className={`w-[72px] h-[72px] rounded-full overflow-hidden flex items-center justify-center font-display font-bold text-3xl text-primary-foreground ${editing ? "cursor-pointer" : ""}`}
                  style={{ background: avatarSrc ? undefined : "var(--gradient-primary)" }}
                >
                  {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
                </div>
                {editing && (
                  <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name / bio */}
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-2">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground font-display font-bold text-base focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Tên hiển thị" />
                    <textarea value={editBio} onChange={e => setEditBio(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Giới thiệu bản thân..." rows={2} />
                  </div>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-lg text-foreground truncate">{displayName}</h2>
                    <p className="text-sm text-muted-foreground font-body truncate">{profile.bio || "Học viên V-Sign"}</p>
                  </>
                )}
              </div>

              {/* Edit controls */}
              {editing ? (
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleCancel} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={handleSave} className="btn-primary-gradient flex items-center gap-1.5 text-sm py-2 px-4">
                    <Save className="w-4 h-4" /> Lưu
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-foreground font-body text-sm font-medium hover:bg-muted transition-colors shrink-0">
                  <Pencil className="w-4 h-4" /> Chỉnh sửa
                </button>
              )}
            </div>
            {profileMessage && <p className="mt-3 text-sm text-primary border-l-2 border-primary pl-2">{profileMessage}</p>}

            {/* Mascot inline */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
              <motion.img src={mascotImg} alt="Mascot" className="w-11 h-11 object-contain drop-shadow shrink-0"
                animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
              <p className="font-body text-sm text-muted-foreground leading-snug">
                {streak >= 7
                  ? `Tuyệt vời! ${streak} ngày liên tiếp 🔥 Kỷ lục ${longestStreak} ngày.`
                  : streak >= 3
                  ? `Giỏi lắm! Streak ${streak} ngày. Tiếp tục phát huy nhé!`
                  : `Chào ${displayName}! Học mỗi ngày để tăng streak nhé.`}
              </p>
            </div>
          </div>

          {/* Security card — flex-1 to fill remaining column height */}
          <div className="card-pastel p-5 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Bảo mật tài khoản</h3>
            </div>
            <div className="space-y-3 flex-1">
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Mật khẩu hiện tại" className={inputCls} />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới" className={inputCls} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới" className={inputCls} />
              {securityError && <p className="text-sm text-destructive">{securityError}</p>}
              {securityMessage && <p className="text-sm text-primary">{securityMessage}</p>}
              <button onClick={handleChangePassword} className="btn-primary-gradient text-sm py-2 px-5">Đổi mật khẩu</button>
            </div>
          </div>
        </div>

        {/* ═══ CENTER COLUMN ═══ */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* 4 stat cards — 2×2 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Flame className="w-6 h-6 text-primary" />, bg: "bg-primary/10", value: `🔥 ${streak}`, label: "Ngày liên tiếp" },
              { icon: <BookOpen className="w-6 h-6 text-secondary" />, bg: "bg-secondary/10", value: completedLessons.length, label: "Bài hoàn thành" },
              { icon: <Star className="w-6 h-6 text-amber-600" />, bg: "bg-amber-100", value: xp, label: "Tổng XP" },
              { icon: <Clock className="w-6 h-6 text-[hsl(var(--success))]" />, bg: "bg-[hsl(var(--success))]/10", value: totalMinutes, label: "Phút học tập" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card-pastel p-4 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>{stat.icon}</div>
                <div>
                  <div className="font-display font-bold text-xl text-foreground leading-none">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-body mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reminder card */}
          <div className="card-pastel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Nhắc nhở học tập</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-foreground">Bật nhắc nhở hàng ngày</span>
              <button onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-12 h-7 rounded-full transition-all relative ${reminderEnabled ? "bg-primary" : "bg-muted"}`}>
                <div className={`w-5 h-5 rounded-full bg-card shadow-md absolute top-1 transition-all ${reminderEnabled ? "right-1" : "left-1"}`} />
              </button>
            </div>
            {reminderEnabled && (
              <div className="mt-3">
                <label className="text-xs text-muted-foreground font-body mb-1 block">Thời gian nhắc nhở</label>
                <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
          </div>

          {/* Badges — flex-1 to fill remaining */}
          <div className="card-pastel p-5 flex-1 flex flex-col min-h-0">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">🏅 Huy hiệu của tôi</h3>
            <div className="grid grid-cols-3 gap-3 flex-1 content-start">
              {BADGES.map((badge) => {
                const unlocked = badge.unlockFn(stats);
                return (
                  <div key={badge.name}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl ${unlocked ? "bg-primary/5" : "opacity-40 grayscale"}`}>
                    <span className="text-2xl mb-1.5">{badge.emoji}</span>
                    <span className="font-display font-bold text-foreground text-xs leading-tight">{badge.name}</span>
                    <span className="text-[10px] text-muted-foreground font-body mt-0.5">{badge.desc}</span>
                    {!unlocked && <span className="text-[10px] text-muted-foreground mt-0.5">🔒</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* Subscription card */}
          <div className="card-pastel p-5 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isPremium ? "bg-amber-100" : "bg-muted"}`}>
              <Crown className={`w-7 h-7 ${isPremium ? "text-amber-500" : "text-muted-foreground"}`} />
            </div>
            <div>
              <span className="font-display font-bold text-foreground block">Gói cước</span>
              <span className={`text-xs font-body font-semibold px-3 py-1 rounded-full inline-block mt-1 ${isPremium ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                {isPremium ? "Premium" : "Free"}
              </span>
              <span className="text-xs text-muted-foreground block mt-1">
                {subscription.status === "ACTIVE" ? `Còn ${subscription.remainingDays} ngày` : "Chưa kích hoạt"}
              </span>
            </div>
          </div>

          {/* Payment card — flex-1 */}
          <div className="card-pastel p-5 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <WalletCards className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Gói cước & thanh toán</h3>
            </div>
            <div className="rounded-2xl bg-muted/50 px-4 py-3 mb-4">
              <p className="text-sm font-body text-foreground">
                Trạng thái: <span className="font-display font-bold">{subscription.status === "ACTIVE" ? "Premium Active" : "Free"}</span>
              </p>
              {subscription.expiresAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Hết hạn: {new Date(subscription.expiresAt).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có giao dịch.</p>
              ) : paymentHistory.map((tx) => (
                <div key={tx.transactionId} className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">{tx.provider} · {tx.planType}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{new Date(tx.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-primary">{tx.amount.toLocaleString("vi-VN")}đ</p>
                    <p className={`text-xs mt-0.5 ${tx.status === "SUCCESS" ? "text-[hsl(var(--success))]" : "text-destructive"}`}>{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity chart */}
          <div className="card-pastel p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Hoạt động tuần này</h3>
            </div>
            <ChartContainer config={chartConfig} className="h-[130px] w-full">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="minutes" radius={[8, 8, 0, 0]} fill="hsl(14 68% 62%)" />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
