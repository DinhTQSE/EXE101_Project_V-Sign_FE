import { motion } from "framer-motion";
import { Crown, Medal, Trophy, Flame } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  streak: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: "Thuỳ Linh", xp: 1500, avatar: "TL", streak: 14 },
  { rank: 2, name: "Kim Mai", xp: 1350, avatar: "KM", streak: 10 },
  { rank: 3, name: "Nhựt Phát", xp: 1200, avatar: "NP", streak: 7 },
  { rank: 4, name: "Đức Khải", xp: 1050, avatar: "ĐK", streak: 5 },
  { rank: 5, name: "Quốc Dinh", xp: 900, avatar: "QD", streak: 4 },
  { rank: 6, name: "Minh Quân", xp: 850, avatar: "MQ", streak: 3 },
  { rank: 7, name: "Hải Yến", xp: 720, avatar: "HY", streak: 6 },
  { rank: 8, name: "Tuấn Anh", xp: 650, avatar: "TA", streak: 2 },
  { rank: 9, name: "Phương Linh", xp: 540, avatar: "PL", streak: 1 },
  { rank: 10, name: "Văn Hùng", xp: 430, avatar: "VH", streak: 3 },
];

const rankColors: Record<number, { bg: string; text: string; icon: React.ReactNode }> = {
  1: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", icon: <Crown className="w-5 h-5 text-amber-500" /> },
  2: { bg: "bg-slate-100 dark:bg-slate-800/40", text: "text-slate-500 dark:text-slate-400", icon: <Medal className="w-5 h-5 text-slate-400" /> },
  3: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", icon: <Medal className="w-5 h-5 text-orange-400" /> },
};

export default function Leaderboard() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">Bảng xếp hạng</h1>
        </div>
        <p className="font-body text-sm text-muted-foreground">Top 10 tuần này • Điểm kinh nghiệm (XP)</p>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 0, 2].map((idx) => {
          const entry = leaderboardData[idx];
          const isFirst = entry.rank === 1;
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`card-pastel p-4 flex flex-col items-center text-center ${isFirst ? "sm:-mt-4" : ""}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-lg text-primary-foreground mb-2 ${
                isFirst ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-card" : ""
              }`} style={{ background: "var(--gradient-primary)" }}>
                {entry.avatar}
              </div>
              {rankColors[entry.rank]?.icon}
              <span className="font-display font-bold text-foreground text-sm mt-1 truncate w-full">{entry.name}</span>
              <span className="text-xs text-primary font-body font-bold mt-0.5">{entry.xp} XP</span>
              <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5 mt-1">
                <Flame className="w-3 h-3 text-primary" /> {entry.streak} ngày
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of the list */}
      <div className="space-y-2">
        {leaderboardData.slice(3).map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="card-pastel p-3.5 flex items-center gap-3"
          >
            <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-display font-bold text-sm text-muted-foreground shrink-0">
              {entry.rank}
            </span>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
              {entry.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-display font-bold text-foreground text-sm truncate block">{entry.name}</span>
              <span className="text-[11px] text-muted-foreground font-body flex items-center gap-1">
                <Flame className="w-3 h-3 text-primary" /> {entry.streak} ngày streak
              </span>
            </div>
            <span className="font-display font-bold text-primary text-sm shrink-0">{entry.xp} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
