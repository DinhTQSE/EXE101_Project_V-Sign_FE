import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserProfile {
  displayName: string;
  avatarUrl: string;
  bio: string;
}

interface OnboardingResponses {
  role: string;
  ageGroup: string;
  purpose: string;
  dailyTime: string;
}

interface LearningStats {
  streak: number;
  lastLoginDate: string;
  completedLessons: number[];
  totalMinutes: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isNewUser: boolean;
  userName: string;
  profile: UserProfile;
  updateProfile: (p: Partial<UserProfile>) => void;
  login: (name: string, isNew: boolean) => void;
  logout: () => void;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  stats: LearningStats;
  completeLesson: (lessonId: number) => void;
  onboardingResponses: OnboardingResponses;
  setOnboardingResponses: (r: OnboardingResponses) => void;
  isPremium: boolean;
  setPremium: (v: boolean) => void;
  layoutMode: "child" | "adult";
  reminderEnabled: boolean;
  setReminderEnabled: (v: boolean) => void;
  reminderTime: string;
  setReminderTime: (t: string) => void;
}

const DEFAULT_STATS: LearningStats = {
  streak: 1,
  lastLoginDate: new Date().toDateString(),
  completedLessons: [],
  totalMinutes: 0,
};

const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  avatarUrl: "",
  bio: "",
};

const DEFAULT_ONBOARDING: OnboardingResponses = {
  role: "",
  ageGroup: "",
  purpose: "",
  dailyTime: "",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function calculateStreak(stats: LearningStats): LearningStats {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (stats.lastLoginDate === today) return stats;
  if (stats.lastLoginDate === yesterday) {
    return { ...stats, streak: stats.streak + 1, lastLoginDate: today };
  }
  return { ...stats, streak: 1, lastLoginDate: today };
}

function getLayoutMode(ageGroup: string): "child" | "adult" {
  return ageGroup === "Dưới 14 tuổi" ? "child" : "adult";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => loadFromStorage("vsign_loggedIn", false));
  const [isNewUser, setIsNewUser] = useState(false);
  const [userName, setUserName] = useState(() => loadFromStorage("vsign_userName", ""));
  const [hasOnboarded, setHasOnboardedState] = useState(() => loadFromStorage("vsign_onboarded", false));
  const [profile, setProfile] = useState<UserProfile>(() => loadFromStorage("vsign_profile", DEFAULT_PROFILE));
  const [stats, setStats] = useState<LearningStats>(() => {
    const saved = loadFromStorage("vsign_stats", DEFAULT_STATS);
    return calculateStreak(saved);
  });
  const [onboardingResponses, setOnboardingResponsesState] = useState<OnboardingResponses>(
    () => loadFromStorage("vsign_onboarding", DEFAULT_ONBOARDING)
  );
  const [isPremium, setIsPremiumState] = useState(() => loadFromStorage("vsign_premium", false));
  const [reminderEnabled, setReminderEnabledState] = useState(() => loadFromStorage("vsign_reminder", false));
  const [reminderTime, setReminderTimeState] = useState(() => loadFromStorage("vsign_reminderTime", "08:00"));

  useEffect(() => { localStorage.setItem("vsign_loggedIn", JSON.stringify(isLoggedIn)); }, [isLoggedIn]);
  useEffect(() => { localStorage.setItem("vsign_userName", JSON.stringify(userName)); }, [userName]);
  useEffect(() => { localStorage.setItem("vsign_onboarded", JSON.stringify(hasOnboarded)); }, [hasOnboarded]);
  useEffect(() => { localStorage.setItem("vsign_stats", JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem("vsign_profile", JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem("vsign_onboarding", JSON.stringify(onboardingResponses)); }, [onboardingResponses]);
  useEffect(() => { localStorage.setItem("vsign_premium", JSON.stringify(isPremium)); }, [isPremium]);
  useEffect(() => { localStorage.setItem("vsign_reminder", JSON.stringify(reminderEnabled)); }, [reminderEnabled]);
  useEffect(() => { localStorage.setItem("vsign_reminderTime", JSON.stringify(reminderTime)); }, [reminderTime]);

  const layoutMode = getLayoutMode(onboardingResponses.ageGroup);

  const login = (name: string, isNew: boolean) => {
    setIsLoggedIn(true);
    setUserName(name);
    setIsNewUser(isNew);
    setIsPremiumState(false);
    if (isNew) {
      setHasOnboardedState(false);
      setProfile({ ...DEFAULT_PROFILE, displayName: name });
      setOnboardingResponsesState(DEFAULT_ONBOARDING);
      setStats(DEFAULT_STATS);
    } else {
      setHasOnboardedState(true);
    }
    setStats((prev) => calculateStreak(prev));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setIsNewUser(false);
    setIsPremiumState(false);
    setProfile(DEFAULT_PROFILE);
    setHasOnboardedState(false);
    setOnboardingResponsesState(DEFAULT_ONBOARDING);
    setStats(DEFAULT_STATS);
    setReminderEnabledState(false);
    setReminderTimeState("08:00");
    localStorage.removeItem("vsign_premium");
    localStorage.removeItem("vsign_profile");
    localStorage.removeItem("vsign_userName");
    localStorage.removeItem("vsign_onboarded");
    localStorage.removeItem("vsign_onboarding");
    localStorage.removeItem("vsign_stats");
    localStorage.removeItem("vsign_reminder");
    localStorage.removeItem("vsign_reminderTime");
  };

  const setHasOnboarded = (v: boolean) => {
    setHasOnboardedState(v);
    setIsNewUser(false);
  };

  const setOnboardingResponses = (r: OnboardingResponses) => {
    setOnboardingResponsesState(r);
  };

  const setPremium = (v: boolean) => setIsPremiumState(v);
  const setReminderEnabled = (v: boolean) => setReminderEnabledState(v);
  const setReminderTime = (t: string) => setReminderTimeState(t);

  const updateProfile = (p: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...p };
      if (p.displayName) setUserName(p.displayName);
      return updated;
    });
  };

  const completeLesson = (lessonId: number) => {
    setStats((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        totalMinutes: prev.totalMinutes + 15,
        lastLoginDate: new Date().toDateString(),
      };
    });
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn, isNewUser, userName, profile, updateProfile, login, logout,
      hasOnboarded, setHasOnboarded, stats, completeLesson,
      onboardingResponses, setOnboardingResponses,
      isPremium, setPremium, layoutMode,
      reminderEnabled, setReminderEnabled, reminderTime, setReminderTime,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
