import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  authApi,
  gamificationApi,
  getDefaultSubscription,
  getPaymentHistory,
  paymentApi,
  USE_BACKEND,
  AccountType,
  AuthSessionDto,
  AuthUserDto,
  PaymentTransaction,
  SubscriptionSummary,
} from "@/services/vsignApi";

interface UserProfile {
  displayName: string;
  avatarUrl: string;
  bio: string;
  email: string;
  accountType: AccountType;
}

interface OnboardingResponses {
  role: string;
  ageGroup: string;
  purpose: string;
  dailyTime: string;
}

interface RewardEvent {
  id: string;
  source: "LESSON_COMPLETE" | "QUIZ_COMPLETE" | "STREAK_BONUS" | "BADGE_EARN";
  xp: number;
  message: string;
}

interface LearningStats {
  streak: number;
  longestStreak: number;
  lastActivityDate: string;
  completedLessons: Array<string | number>;
  totalMinutes: number;
  xp: number;
  quizXpEvents: string[];
  perfectQuizCount: number;
  streakChangedToday: boolean;
  streakResetNotified: boolean;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  accessToken: string;
  isLoggedIn: boolean;
  isNewUser: boolean;
  userName: string;
  profile: UserProfile;
  updateProfile: (p: Partial<UserProfile>) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  stats: LearningStats;
  completeLesson: (lessonId: string | number, xpReward?: number) => RewardEvent | null;
  awardQuizXp: (eventId: string, xpReward?: number, isPerfect?: boolean) => RewardEvent | null;
  onboardingResponses: OnboardingResponses;
  setOnboardingResponses: (r: OnboardingResponses) => void;
  isPremium: boolean;
  setPremium: (v: boolean, payment?: PaymentTransaction) => void;
  subscription: SubscriptionSummary;
  paymentHistory: PaymentTransaction[];
  layoutMode: "child" | "adult";
  reminderEnabled: boolean;
  setReminderEnabled: (v: boolean) => void;
  reminderTime: string;
  setReminderTime: (t: string) => void;
  lastReward: RewardEvent | null;
  clearLastReward: () => void;
}

const DEFAULT_STATS: LearningStats = {
  streak: 0,
  longestStreak: 0,
  lastActivityDate: "",
  completedLessons: [],
  totalMinutes: 0,
  xp: 0,
  quizXpEvents: [],
  perfectQuizCount: 0,
  streakChangedToday: false,
  streakResetNotified: false,
};

const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  avatarUrl: "",
  bio: "",
  email: "",
  accountType: "BASIC",
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
    return v ? { ...fallback, ...JSON.parse(v) } : fallback;
  } catch {
    return fallback;
  }
}

function loadPrimitive<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function vietnamDateKey(date = new Date()) {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function dateDiffDays(from: string, to: string) {
  const fromDate = new Date(`${from}T00:00:00+07:00`).getTime();
  const toDate = new Date(`${to}T00:00:00+07:00`).getTime();
  return Math.round((toDate - fromDate) / 86400000);
}

function applyLearningActivity(stats: LearningStats) {
  const today = vietnamDateKey();
  if (stats.lastActivityDate === today) {
    return { stats: { ...stats, streakChangedToday: false, streakResetNotified: false }, streakChanged: false, reset: false };
  }

  const gap = stats.lastActivityDate ? dateDiffDays(stats.lastActivityDate, today) : 0;
  const reset = !!stats.lastActivityDate && gap > 1;
  const nextStreak = !stats.lastActivityDate || reset ? 1 : stats.streak + 1;
  const updated: LearningStats = {
    ...stats,
    streak: nextStreak,
    longestStreak: Math.max(stats.longestStreak, nextStreak),
    lastActivityDate: today,
    streakChangedToday: true,
    streakResetNotified: reset,
  };

  return { stats: updated, streakChanged: true, reset };
}

function getLayoutMode(ageGroup: string): "child" | "adult" {
  return ageGroup === "Dưới 14 tuổi" ? "child" : "adult";
}

function sessionToProfile(session: AuthSessionDto): UserProfile {
  return userToProfile(session.user);
}

function userToProfile(user: AuthUserDto): UserProfile {
  return {
    displayName: user.displayName,
    avatarUrl: user.avatarUrl || "",
    bio: user.bio || "",
    email: user.email,
    accountType: user.accountType,
  };
}

function isActiveSubscription(subscription: SubscriptionSummary) {
  return subscription.status === "ACTIVE";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState(() => loadPrimitive("vsign_accessToken", ""));
  const [isLoggedIn, setIsLoggedIn] = useState(() => loadPrimitive("vsign_loggedIn", false));
  const [isNewUser, setIsNewUser] = useState(false);
  const [userName, setUserName] = useState(() => loadPrimitive("vsign_userName", ""));
  const [hasOnboarded, setHasOnboardedState] = useState(() => loadPrimitive("vsign_onboarded", false));
  const [profile, setProfile] = useState<UserProfile>(() => loadFromStorage("vsign_profile", DEFAULT_PROFILE));
  const [stats, setStats] = useState<LearningStats>(() => loadFromStorage("vsign_stats", DEFAULT_STATS));
  const [onboardingResponses, setOnboardingResponsesState] = useState<OnboardingResponses>(
    () => loadFromStorage("vsign_onboarding", DEFAULT_ONBOARDING)
  );
  const [isPremium, setIsPremiumState] = useState(() => loadPrimitive("vsign_premium", false));
  const [subscription, setSubscription] = useState<SubscriptionSummary>(() =>
    loadFromStorage("vsign_subscription", getDefaultSubscription(loadPrimitive("vsign_premium", false)))
  );
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>(() => getPaymentHistory());
  const [reminderEnabled, setReminderEnabledState] = useState(() => loadPrimitive("vsign_reminder", false));
  const [reminderTime, setReminderTimeState] = useState(() => loadPrimitive("vsign_reminderTime", "08:00"));
  const [lastReward, setLastReward] = useState<RewardEvent | null>(null);

  useEffect(() => { localStorage.setItem("vsign_accessToken", JSON.stringify(accessToken)); }, [accessToken]);
  useEffect(() => { localStorage.setItem("vsign_loggedIn", JSON.stringify(isLoggedIn)); }, [isLoggedIn]);
  useEffect(() => { localStorage.setItem("vsign_userName", JSON.stringify(userName)); }, [userName]);
  useEffect(() => { localStorage.setItem("vsign_onboarded", JSON.stringify(hasOnboarded)); }, [hasOnboarded]);
  useEffect(() => { localStorage.setItem("vsign_stats", JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem("vsign_profile", JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem("vsign_onboarding", JSON.stringify(onboardingResponses)); }, [onboardingResponses]);
  useEffect(() => { localStorage.setItem("vsign_premium", JSON.stringify(isPremium)); }, [isPremium]);
  useEffect(() => { localStorage.setItem("vsign_subscription", JSON.stringify(subscription)); }, [subscription]);
  useEffect(() => { localStorage.setItem("vsign_reminder", JSON.stringify(reminderEnabled)); }, [reminderEnabled]);
  useEffect(() => { localStorage.setItem("vsign_reminderTime", JSON.stringify(reminderTime)); }, [reminderTime]);

  const layoutMode = useMemo(() => getLayoutMode(onboardingResponses.ageGroup), [onboardingResponses.ageGroup]);

  const hydrateBackendState = useCallback(async (token: string) => {
    if (!USE_BACKEND || !token) return;

    try {
      const [user, subscriptionSummary, payments, gamification] = await Promise.all([
        authApi.getMe(token),
        paymentApi.getSubscription(token),
        paymentApi.getPaymentHistory(token),
        gamificationApi.getSummary(token),
      ]);

      const nextProfile = userToProfile(user);
      setProfile(nextProfile);
      setUserName(nextProfile.displayName);
      setIsPremiumState(isActiveSubscription(subscriptionSummary));
      setSubscription(subscriptionSummary);
      setPaymentHistory(payments);
      setStats((prev) => ({
        ...prev,
        xp: gamification.totalXp,
        streak: gamification.currentStreak,
        longestStreak: Math.max(prev.longestStreak, gamification.longestStreak),
      }));
    } catch {
      // Keep cached/local state when the backend is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    if (USE_BACKEND && isLoggedIn && accessToken) {
      void hydrateBackendState(accessToken);
    }
  }, [accessToken, hydrateBackendState, isLoggedIn]);

  const applySession = (session: AuthSessionDto, isNew: boolean) => {
    const nextProfile = sessionToProfile(session);
    setAccessToken(session.accessToken);
    setIsLoggedIn(true);
    setUserName(nextProfile.displayName);
    setProfile(nextProfile);
    setIsNewUser(isNew);
    setIsPremiumState(nextProfile.accountType === "PREMIUM");
    setSubscription(getDefaultSubscription(nextProfile.accountType === "PREMIUM"));
    if (isNew) {
      setHasOnboardedState(false);
      setOnboardingResponsesState(DEFAULT_ONBOARDING);
      setStats(DEFAULT_STATS);
    } else {
      setHasOnboardedState(true);
    }
    if (USE_BACKEND) {
      void hydrateBackendState(session.accessToken);
    }
  };

  const login = async (input: LoginInput) => {
    const session = await authApi.login(input);
    applySession(session, false);
  };

  const register = async (input: RegisterInput) => {
    const session = await authApi.register(input);
    applySession(session, true);
  };

  const logout = () => {
    setAccessToken("");
    setIsLoggedIn(false);
    setUserName("");
    setIsNewUser(false);
    setIsPremiumState(false);
    setSubscription(getDefaultSubscription(false));
    setProfile(DEFAULT_PROFILE);
    setHasOnboardedState(false);
    setOnboardingResponsesState(DEFAULT_ONBOARDING);
    setStats(DEFAULT_STATS);
    setReminderEnabledState(false);
    setReminderTimeState("08:00");
    setPaymentHistory([]);
    setLastReward(null);
    [
      "vsign_accessToken", "vsign_premium", "vsign_subscription", "vsign_profile",
      "vsign_userName", "vsign_onboarded", "vsign_onboarding", "vsign_stats",
      "vsign_reminder", "vsign_reminderTime", "vsign_payment_history",
    ].forEach((key) => localStorage.removeItem(key));
  };

  const setHasOnboarded = (v: boolean) => {
    setHasOnboardedState(v);
    setIsNewUser(false);
  };

  const setOnboardingResponses = (r: OnboardingResponses) => setOnboardingResponsesState(r);

  const setPremium = (v: boolean, payment?: PaymentTransaction) => {
    setIsPremiumState(v);
    setProfile((prev) => ({ ...prev, accountType: v ? "PREMIUM" : "BASIC" }));
    setSubscription(getDefaultSubscription(v, payment?.planType));
    if (payment) {
      setPaymentHistory((prev) => [payment, ...prev]);
    }
  };

  const setReminderEnabled = (v: boolean) => setReminderEnabledState(v);
  const setReminderTime = (t: string) => setReminderTimeState(t);

  const updateProfile = async (p: Partial<UserProfile>) => {
    const updated = accessToken ? await authApi.updateProfile(accessToken, p) : null;
    setProfile((prev) => {
      const next = {
        ...prev,
        ...(updated ? {
          displayName: updated.displayName,
          avatarUrl: updated.avatarUrl || "",
          bio: updated.bio || "",
          email: updated.email,
          accountType: updated.accountType,
        } : p),
      };
      if (next.displayName) setUserName(next.displayName);
      return next;
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(accessToken, { currentPassword, newPassword });
  };

  const requestPasswordReset = async (email: string) => {
    await authApi.requestPasswordReset(email);
  };

  const completeLesson = (lessonId: string | number, xpReward = 20) => {
    if (stats.completedLessons.includes(lessonId)) return null;
    const reward: RewardEvent = {
      id: `lesson-${lessonId}-${Date.now()}`,
      source: "LESSON_COMPLETE",
      xp: xpReward,
      message: `+${xpReward} XP từ bài học`,
    };
    setStats((prev) => {
      const activity = applyLearningActivity(prev);
      return {
        ...activity.stats,
        completedLessons: [...activity.stats.completedLessons, lessonId],
        totalMinutes: activity.stats.totalMinutes + 15,
        xp: activity.stats.xp + xpReward,
      };
    });
    if (USE_BACKEND && accessToken) {
      void gamificationApi
        .awardXp(accessToken, {
          eventId: `lesson-${lessonId}`,
          source: "LESSON_COMPLETE",
          xpDelta: xpReward,
          activityDate: vietnamDateKey(),
        })
        .then((result) => {
          setStats((prev) => ({ ...prev, xp: result.totalXp }));
        })
        .catch(() => undefined);
    }
    setLastReward(reward);
    return reward;
  };

  const awardQuizXp = (eventId: string, xpReward = 10, isPerfect = false) => {
    if (stats.quizXpEvents.includes(eventId)) return null;
    const reward: RewardEvent = {
      id: `${eventId}-${Date.now()}`,
      source: "QUIZ_COMPLETE",
      xp: xpReward,
      message: `+${xpReward} XP từ bài kiểm tra`,
    };
    setStats((prev) => {
      const activity = applyLearningActivity(prev);
      return {
        ...activity.stats,
        quizXpEvents: [...activity.stats.quizXpEvents, eventId],
        perfectQuizCount: prev.perfectQuizCount + (isPerfect ? 1 : 0),
        xp: activity.stats.xp + xpReward,
      };
    });
    if (USE_BACKEND && accessToken) {
      void gamificationApi
        .awardXp(accessToken, {
          eventId,
          source: "QUIZ_COMPLETE",
          xpDelta: xpReward,
          activityDate: vietnamDateKey(),
        })
        .then((result) => {
          setStats((prev) => ({ ...prev, xp: result.totalXp }));
        })
        .catch(() => undefined);
    }
    setLastReward(reward);
    return reward;
  };

  const clearLastReward = () => setLastReward(null);

  return (
    <AuthContext.Provider value={{
      accessToken,
      isLoggedIn, isNewUser, userName, profile, updateProfile, login, register, logout,
      changePassword, requestPasswordReset,
      hasOnboarded, setHasOnboarded, stats, completeLesson, awardQuizXp,
      onboardingResponses, setOnboardingResponses,
      isPremium, setPremium, subscription, paymentHistory, layoutMode,
      reminderEnabled, setReminderEnabled, reminderTime, setReminderTime,
      lastReward, clearLastReward,
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
