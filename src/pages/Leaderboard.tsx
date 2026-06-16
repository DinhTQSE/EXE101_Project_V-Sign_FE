import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { gamificationApi, LeaderboardPeriod, USE_BACKEND } from "@/services/vsignApi";

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  streak: number;
  isCurrentUser?: boolean;
}

type Period = LeaderboardPeriod;

const rankColors: Record<number, { icon: React.ReactNode }> = {
  1: { icon: <Crown className="w-5 h-5 text-amber-500" /> },
  2: { icon: <Medal className="w-5 h-5 text-slate-400" /> },
  3: { icon: <Medal className="w-5 h-5 text-orange-400" /> },
};

function initials(name: string) {
  return name.split(" ").map(part => part.charAt(0)).join("").slice(0, 2).toUpperCase();
}

export default function Leaderboard() {
  const { accessToken, isLoggedIn, userName, profile, stats } = useAuth();
  const [period, setPeriod] = useState<Period>("WEEKLY");
  const [remoteEntries, setRemoteEntries] = useState<LeaderboardEntry[] | null>(null);
  const [remoteCurrentUser, setRemoteCurrentUser] = useState<LeaderboardEntry | null>(null);
  const displayName = profile.displayName || userName || "Bạn";

  useEffect(() => {
    if (!USE_BACKEND || !isLoggedIn || !accessToken) {
      setRemoteEntries(null);
      setRemoteCurrentUser(null);
      return;
    }

    let active = true;
    void gamificationApi
      .getLeaderboard(accessToken, period)
      .then((data) => {
        if (!active) return;
        const currentUserId = data.currentUser?.userId;
        const entries = data.entries.map((entry) => {
          const name = entry.fullName || "Nguoi hoc";
          return {
            rank: entry.rank,
            name,
            avatar: initials(name),
            xp: entry.xp,
            streak: entry.userId === currentUserId ? stats.streak : 0,
            isCurrentUser: entry.userId === currentUserId,
          };
        });
        const currentUser = data.currentUser
          ? {
              rank: data.currentUser.rank,
              name: data.currentUser.fullName || displayName,
              avatar: initials(data.currentUser.fullName || displayName),
              xp: data.currentUser.xp,
              streak: stats.streak,
              isCurrentUser: true,
            }
          : entries.find((entry) => entry.isCurrentUser) || null;
        setRemoteEntries(entries.length ? entries : null);
        setRemoteCurrentUser(currentUser);
      })
      .catch(() => {
        if (!active) return;
        setRemoteEntries(null);
        setRemoteCurrentUser(null);
      });

    return () => {
      active = false;
    };
  }, [accessToken, displayName, isLoggedIn, period, stats.streak]);

  const leaderboardData = useMemo(() => {
    if (remoteEntries) return remoteEntries;
    const currentUser: Omit<LeaderboardEntry, "rank"> = {
      name: displayName,
      avatar: initials(displayName),
      xp: stats.xp,
      streak: stats.streak,
      isCurrentUser: true,
    };
    return [currentUser]
      .sort((a, b) => b.xp - a.xp || b.streak - a.streak || a.name.localeCompare(b.name, "vi"))
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [displayName, period, remoteEntries, stats.streak, stats.xp]);

  const topTen = leaderboardData.slice(0, 10);
  const currentUserRank = remoteCurrentUser || leaderboardData.find(entry => entry.isCurrentUser);
  const podium = topTen.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="hero-panel p-5 md:p-7 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="icon-tile !w-12 !h-12">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">Bảng xếp hạng</h1>
        </div>
        <p className="font-body text-sm md:text-base text-white/85 md:ml-[60px]">Xếp hạng theo XP, cập nhật theo tuần/tháng</p>
      </div>

      <div className="inline-flex rounded-[18px] bg-muted/80 p-1 mb-6 shadow-sm">
        {(["WEEKLY", "MONTHLY"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all ${
              period === p ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p === "WEEKLY" ? "Tuần" : "Tháng"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        {[podium[1], podium[0], podium[2]].filter(Boolean).map((entry) => {
          const isFirst = entry.rank === 1;
          return (
            <motion.div
              key={`${period}-${entry.rank}-${entry.name}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card-pop p-2 sm:p-4 md:p-5 flex flex-col items-center text-center ${isFirst ? "sm:-mt-4" : ""} ${
                entry.isCurrentUser ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-display font-extrabold text-sm sm:text-lg text-primary-foreground mb-2 shadow-lg ${
                isFirst ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-card" : ""
              }`} style={{ background: "var(--gradient-primary)" }}>
                {entry.avatar}
              </div>
              {rankColors[entry.rank]?.icon}
              <span className="font-display font-extrabold text-foreground text-xs sm:text-base mt-1 truncate w-full">{entry.name}</span>
              <span className="text-[10px] sm:text-xs text-primary font-body font-bold mt-0.5">{entry.xp} XP</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-body flex items-center gap-0.5 mt-1">
                <Flame className="w-3 h-3 text-primary shrink-0" /> {entry.streak} ngày
              </span>
            </motion.div>
          );
        })}
      </div>

      {currentUserRank && currentUserRank.rank > 10 && (
        <div className="card-pop p-3.5 flex items-center gap-3 mb-3 ring-2 ring-primary">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm shrink-0">
            {currentUserRank.rank}
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-display font-extrabold text-foreground text-base truncate block">Thứ hạng của bạn</span>
            <span className="text-[11px] text-muted-foreground font-body">{currentUserRank.xp} XP · {currentUserRank.streak} ngày streak</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {topTen.slice(3).map((entry, i) => (
          <motion.div
            key={`${period}-${entry.rank}-${entry.name}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            className={`card-pop p-3.5 flex items-center gap-3 ${entry.isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""}`}
          >
            <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-display font-bold text-sm text-muted-foreground shrink-0">
              {entry.rank}
            </span>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
              {entry.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-display font-extrabold text-foreground text-sm truncate block">{entry.isCurrentUser ? "Bạn" : entry.name}</span>
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
