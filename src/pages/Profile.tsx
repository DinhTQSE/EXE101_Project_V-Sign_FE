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

export default function Profile() {
  const {
    userName, stats, profile, updateProfile, isPremium, changePassword, subscription, paymentHistory,
    reminderEnabled, setReminderEnabled, reminderTime, setReminderTime,
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
    if (!editName.trim()) {
      setProfileMessage("Tên hiển thị không được để trống.");
      return;
    }
    await updateProfile({ displayName: editName.trim(), bio: editBio, avatarUrl: previewAvatar });
    setProfileMessage("Đã lưu hồ sơ.");
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(profile.displayName || userName);
    setEditBio(profile.bio);
    setPreviewAvatar(profile.avatarUrl);
    setProfileMessage("");
    setEditing(false);
  };

  const handleChangePassword = async () => {
    setSecurityError("");
    setSecurityMessage("");
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setSecurityError("Mật khẩu mới cần tối thiểu 8 ký tự, có chữ hoa và số.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setSecurityMessage("Đã đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setSecurityError(err?.message || "Không thể đổi mật khẩu.");
    }
  };

  const displayName = profile.displayName || userName || "Người học mới";
  const avatarSrc = editing ? previewAvatar : profile.avatarUrl;

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Avatar card - spans 1 col on mobile, 1 on desktop */}
        <div className="card-pastel p-6 sm:col-span-2">
          <div className="flex items-center gap-5">
            {editing ? (
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-display font-bold text-3xl text-primary-foreground shrink-0 cursor-pointer"
                  style={{ background: avatarSrc ? undefined : "var(--gradient-primary)" }}
                  onClick={() => fileRef.current?.click()}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                  ) : displayName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            ) : (
              <div
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-display font-bold text-3xl text-primary-foreground shrink-0"
                style={{ background: avatarSrc ? undefined : "var(--gradient-primary)" }}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground font-display font-bold text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tên hiển thị"
                  />
                  <textarea
                    value={editBio} onChange={e => setEditBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Giới thiệu bản thân..."
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold text-xl text-foreground truncate">{displayName}</h2>
                  <p className="text-sm text-muted-foreground font-body">{profile.bio || "Học viên V-Sign"}</p>
                </>
              )}
            </div>

            {editing ? (
              <div className="flex gap-2 shrink-0">
                <button onClick={handleCancel} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                <button onClick={handleSave} className="btn-primary-gradient flex items-center gap-1.5 text-sm py-2 px-4">
                  <Save className="w-4 h-4" /> Lưu
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-foreground font-body text-sm font-medium hover:bg-muted transition-colors shrink-0"
              >
                <Pencil className="w-4 h-4" /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* Subscription badge */}
        <div className={`card-pastel p-6 flex flex-col items-center justify-center text-center ${isPremium ? "" : ""}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${isPremium ? "bg-amber-100" : "bg-muted"}`}>
            <Crown className={`w-7 h-7 ${isPremium ? "text-amber-500" : "text-muted-foreground"}`} />
          </div>
          <span className="font-display font-bold text-foreground text-sm">Gói cước</span>
          <span className={`text-xs font-body font-semibold mt-1 px-3 py-1 rounded-full ${
            isPremium ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
          }`}>
            {isPremium ? "Premium" : "Free"}
          </span>
          <span className="text-[11px] text-muted-foreground mt-2">
            {subscription.status === "ACTIVE" ? `Còn ${subscription.remainingDays} ngày` : "Chưa kích hoạt"}
          </span>
        </div>
      </div>

      {profileMessage && (
        <div className="card-pastel p-3 mb-6 text-sm text-foreground border-l-4 border-primary">
          {profileMessage}
        </div>
      )}

      {/* Stat cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-pastel p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Flame className="w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">🔥 {streak}</span>
          <span className="text-xs text-muted-foreground font-body">Ngày liên tiếp</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-pastel p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-secondary" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">{completedLessons.length}</span>
          <span className="text-xs text-muted-foreground font-body">Bài hoàn thành</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-pastel p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-3">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">{xp}</span>
          <span className="text-xs text-muted-foreground font-body">Tổng XP</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-pastel p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--success))]/10 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-[hsl(var(--success))]" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">{totalMinutes}</span>
          <span className="text-xs text-muted-foreground font-body">Phút học tập</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card-pastel p-5">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-foreground text-sm">Bảo mật tài khoản</h3>
          </div>
          <div className="space-y-3">
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Mật khẩu hiện tại"
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {securityError && <p className="text-xs text-destructive">{securityError}</p>}
            {securityMessage && <p className="text-xs text-primary">{securityMessage}</p>}
            <button onClick={handleChangePassword} className="btn-primary-gradient text-sm py-2 px-4">Đổi mật khẩu</button>
          </div>
        </div>

        <div className="card-pastel p-5">
          <div className="flex items-center gap-2 mb-4">
            <WalletCards className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-foreground text-sm">Gói cước & thanh toán</h3>
          </div>
          <div className="rounded-2xl bg-muted/50 p-3 mb-3">
            <p className="text-sm font-body text-foreground">
              Trạng thái: <span className="font-display font-bold">{subscription.status === "ACTIVE" ? "Premium Active" : "Free"}</span>
            </p>
            {subscription.expiresAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Hết hạn: {new Date(subscription.expiresAt).toLocaleDateString("vi-VN")}
              </p>
            )}
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {paymentHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">Chưa có giao dịch.</p>
            ) : paymentHistory.map((tx) => (
              <div key={tx.transactionId} className="flex items-center justify-between rounded-xl border border-border p-2 text-xs">
                <div>
                  <p className="font-body font-semibold text-foreground">{tx.provider} · {tx.planType}</p>
                  <p className="text-muted-foreground">{new Date(tx.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary">{tx.amount.toLocaleString("vi-VN")}đ</p>
                  <p className={tx.status === "SUCCESS" ? "text-[hsl(var(--success))]" : "text-destructive"}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reminder + Chart row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Daily reminder */}
        <div className="card-pastel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-foreground text-sm">Nhắc nhở học tập</h3>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-body text-sm text-foreground">Bật nhắc nhở hàng ngày</span>
            <button
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`w-12 h-7 rounded-full transition-all relative ${reminderEnabled ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-card shadow-md absolute top-1 transition-all ${reminderEnabled ? "right-1" : "left-1"}`} />
            </button>
          </div>
          {reminderEnabled && (
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">Thời gian nhắc nhở</label>
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="px-3 py-2 rounded-xl border border-input bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>

        {/* Activity chart */}
        <div className="card-pastel p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-foreground text-sm">Hoạt động tuần này</h3>
          </div>
          <ChartContainer config={chartConfig} className="h-[140px] w-full">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="minutes" radius={[8, 8, 0, 0]} fill="hsl(14 68% 62%)" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Badges section */}
      <div className="card-pastel p-5 mb-6">
        <h3 className="font-display font-bold text-foreground text-sm mb-4 flex items-center gap-2">
          🏅 Huy hiệu của tôi
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { emoji: "🏆", name: "Chiến thần VSL", desc: "Hoàn thành 50 bài học", unlocked: completedLessons.length >= 50 },
            { emoji: "🦉", name: "Cú đêm học tập", desc: "Học sau 10 giờ tối", unlocked: true },
            { emoji: "🔥", name: "Chuỗi 7 ngày", desc: "Streak 7 ngày liên tiếp", unlocked: streak >= 7 },
            { emoji: "⭐", name: "Ngôi sao mới", desc: "Hoàn thành bài đầu tiên", unlocked: completedLessons.length >= 1 },
            { emoji: "💎", name: "Kim cương", desc: "Đạt 1000 XP", unlocked: xp >= 1000 },
            { emoji: "🎯", name: "Bách phát bách trúng", desc: "Một bài thi đạt điểm tuyệt đối", unlocked: perfectQuizCount >= 1 },
          ].map((badge) => (
            <div
              key={badge.name}
              className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
                badge.unlocked ? "bg-primary/5" : "opacity-40 grayscale"
              }`}
            >
              <span className="text-3xl mb-2">{badge.emoji}</span>
              <span className="font-display font-bold text-foreground text-xs">{badge.name}</span>
              <span className="text-[10px] text-muted-foreground font-body mt-0.5">{badge.desc}</span>
              {!badge.unlocked && <span className="text-[10px] text-muted-foreground font-body mt-1">🔒 Chưa mở</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Mascot */}
      <div className="flex items-start gap-4">
        <motion.img
          src={mascotImg} alt="Mascot"
          className="w-20 h-20 object-contain drop-shadow-lg shrink-0"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="speech-bubble flex-1">
          <p className="font-body text-sm text-foreground">
            {streak >= 7
              ? `Tuyệt vời quá ${displayName} ơi! ${streak} ngày liên tiếp, kỷ lục ${longestStreak} ngày.`
              : streak >= 3
              ? `Giỏi quá ${displayName} ơi! Streak ${streak} ngày rồi. Tiếp tục phát huy nhé!`
              : `Chào ${displayName}! Hãy học mỗi ngày để tăng streak nhé.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
