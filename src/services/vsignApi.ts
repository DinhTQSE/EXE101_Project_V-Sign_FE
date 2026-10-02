import { getApiBaseUrl } from "@/services/apiConfig";

export type AccountType = "BASIC" | "PREMIUM" | "ADMIN";
export type PaymentProvider = "MOMO" | "ZALOPAY";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "TIMEOUT";
export type PlanType = "MONTHLY" | "YEARLY";
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN" | "CONTENT_REVIEWER";

export interface ApiErrorShape {
  code: string;
  message: string;
  validationErrors?: Record<string, string>;
}

export interface AuthUserDto {
  id: string;
  email: string;
  displayName: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  role?: UserRole;
  accountType: AccountType;
  subscription?: {
    planType: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

export interface AuthSessionDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CompleteResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SubscriptionSummary {
  planType: PlanType | null;
  status: "FREE" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startedAt?: string;
  expiresAt?: string;
  remainingDays: number;
}

export interface PaymentPlan {
  planId?: string;
  planType: PlanType;
  name: string;
  amount?: number;
  price: number;
  currency: "VND";
  durationDays: number;
}

export interface PaymentOrderRequest {
  provider: PaymentProvider;
  planType: PlanType;
}

export interface PaymentOrderResponse {
  transactionId: string;
  providerTransactionId: string;
  provider: PaymentProvider;
  planType: PlanType;
  amount: number;
  currency: "VND";
  status: PaymentStatus;
  qrCodeData: string;
  deepLink: string;
  expiresAt: string;
}

export interface PaymentTransaction {
  transactionId: string;
  providerTransactionId: string;
  provider: PaymentProvider;
  planType: PlanType;
  amount: number;
  currency: "VND";
  status: PaymentStatus;
  createdAt: string;
  retryable?: boolean;
}

export interface AdminUserDto {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: "ACTIVE" | "DISABLED";
  accountType: AccountType;
  createdAt: string;
  updatedAt?: string;
  lastSeenAt?: string | null;
  totalXp: number;
  currentStreak: number;
}

export interface AdminUserActivityDto {
  activeSeconds: number;
  completedLessons: number;
  quizAttempts: number;
  aiAttempts: number;
  aiPassedAttempts: number;
  lastSeenAt?: string | null;
}

export interface AdminUserDetailDto {
  user: AdminUserDto;
  activity: AdminUserActivityDto;
}

export interface AdminUserListDto {
  users: AdminUserDto[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface AdminUserUpdateInput {
  displayName?: string;
  active?: boolean;
  accountType?: AccountType;
  role?: UserRole;
  reason?: string;
}

export interface AdminMetricsOverviewDto {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  activeUsersInRange: number;
  premiumUsers: number;
  totalRevenueVnd: number;
  successfulPayments: number;
  pendingReviews: number;
  lessonCompletions: number;
  quizAttempts: number;
  aiAttempts: number;
  aiSuccessRate: number;
  averageActiveSeconds: number;
  topActiveUsers: Array<{
    email: string;
    displayName: string;
    activeSeconds: number;
  }>;
}

export interface AdminUsageMetricsDto {
  granularity: string;
  points: Array<{
    date: string;
    activeSeconds: number;
    lessonCompletions: number;
    quizAttempts: number;
    aiAttempts: number;
  }>;
}

export interface AdminPaymentRecordDto {
  transactionId: string;
  userEmail: string;
  planId: string;
  amount: number;
  currency: "VND";
  status: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  overrideReason?: string;
}

export interface AdminPaymentPageDto {
  payments: AdminPaymentRecordDto[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface AdminAuditLogDto {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  createdAt: string;
}

export type LeaderboardPeriod = "WEEKLY" | "MONTHLY";

export interface GamificationSummary {
  userId: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  badges?: Array<{
    badgeId: string;
    name: string;
    earnedAt: string;
  }>;
}

export interface XpAwardRequest {
  eventId: string;
  source: "LESSON_COMPLETE" | "QUIZ_COMPLETE" | "STREAK_BONUS" | "BADGE_EARN";
  xpDelta: number;
  activityDate: string;
}

export interface XpAwardResult {
  userId: string;
  eventId: string;
  totalXp: number;
  xpAwarded: number;
  duplicate: boolean;
}

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  xp: number;
}

export interface LeaderboardResponseDto {
  period: LeaderboardPeriod;
  page: number;
  size: number;
  entries: LeaderboardEntryDto[];
  currentUser?: LeaderboardEntryDto;
}

export interface SignatureAttemptRequest {
  userStoryId?: string;
  practiceItemId: string;
  documentUploadId?: string;
  signatureVector: string;
  durationMs: number;
  aiStatus?: string;
  targetGloss?: string;
  predictedGloss?: string;
  confidence?: number;
  correct?: boolean;
  framesProcessed?: number;
  handsDetectedFrames?: number;
  inferenceMs?: number;
  modelVersion?: string;
  labelVersion?: string;
}

export interface SignatureAttemptResponse {
  attemptId: string;
  practiceItemId: string;
  status: "SUBMITTED" | "PASSED" | "RETRY_REQUIRED";
  score: number;
  targetGloss?: string;
  predictedGloss?: string;
  confidence?: number;
  correct?: boolean;
  feedbackCodes: string[];
  currentUsage?: number;
  maxLimit?: number;
  warningMessage?: string;
}


export interface UnitSummaryDto {
  unitId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  chapterCount: number;
  orderIndex: number;
}

export interface ChapterSummaryDto {
  chapterId: string;
  title: string;
  description?: string;
  lessonCount: number;
  orderIndex: number;
  requiresPremium: boolean;
  locked: boolean;
  completionPercent: number;
}

export interface LessonSummaryDto {
  lessonId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  durationSeconds: number;
  orderIndex: number;
  requiresPremium: boolean;
  locked: boolean;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface LessonProgressDto {
  lessonId: string;
  completionPct: number;
  lastPositionSeconds: number;
  phase: string;
  currentQuestionIndex?: number | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface LessonDetailDto {
  lessonId: string;
  title: string;
  videoUrl?: string;
  requiresPremium: boolean;
  progress: LessonProgressDto;
}

export interface PracticeItemSummaryDto {
  itemId: string;
  lessonId: string;
  label: string;
  category: string;
  level: string;
  expectedGloss: string;
  sourceVideoFile?: string;
  videoUrl?: string;
}

export interface PracticeItemsPageDto {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  content: PracticeItemSummaryDto[];
}

export interface LessonProgressRequest {
  completionPct: number;
  lastPositionSeconds: number;
  phase: "VIDEO" | "PRACTICE" | "QUIZ" | "DONE";
  currentQuestionIndex?: number | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface QuizOptionDto {
  id: string;
  text: string;
  videoUrl?: string;
}

export interface QuizQuestionDto {
  id: string;
  prompt: string;
  options: QuizOptionDto[];
  correctAnswerId?: string | null;
}

export interface LessonQuizDto {
  lessonId: string;
  quizId: string;
  attemptId: string;
  questions: QuizQuestionDto[];
}

export interface QuizSubmitResultDto {
  attemptId: string;
  score: number;
  passed: boolean;
  xpAwarded: number;
  reviewAvailable: boolean;
  timedOut: boolean;
  unansweredCount: number;
}

export interface DictionaryEntryDto {
  id: number;
  entryId: string;
  word: string;
  keyword?: string;
  category: string;
  difficulty: string;
  difficultyLevel: number;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface AssessmentSummaryDto {
  id: string;
  title: string;
  questionCount: number;
  passingScore: number;
}

export interface AssessmentDetailDto {
  id: string;
  title: string;
  passingScore: number;
  questions: QuizQuestionDto[];
}

export interface AssessmentSubmitResultDto {
  assessmentId: string;
  userId: string;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  awardedXp: number;
}

const API_BASE_URL = getApiBaseUrl();
export const USE_BACKEND = true;

let unauthorizedListener: (() => void) | null = null;

export function registerUnauthorizedListener(listener: () => void) {
  unauthorizedListener = listener;
}

export function handleUnauthorizedResponse() {
  if (unauthorizedListener) {
    unauthorizedListener();
  }
}

function makeApiError(code: string, message: string, validationErrors?: Record<string, string>): ApiErrorShape {
  return { code, message, validationErrors };
}

function normalizeValidationErrors(raw: unknown): Record<string, string> | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return raw.reduce<Record<string, string>>((acc, item) => {
      const field = item?.field || item?.name;
      const message = item?.message || item?.defaultMessage;
      if (field && message) acc[field] = message;
      return acc;
    }, {});
  }
  if (typeof raw === "object") return raw as Record<string, string>;
  return undefined;
}


function getMockFallbackData<T>(path: string, init?: RequestInit): T {
  const url = path.split("?")[0];
  console.warn(`[Demo Mode] Request to ${path} fallback active.`);

  // Auth & User Profile
  if (url.includes("/auth/me") || url === "/me") {
    return {
      id: "demo-user-1",
      email: "demo@vsign.vn",
      displayName: "Demo User",
      fullName: "Demo User",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser",
      bio: "Tài khoản Demo trải nghiệm V-Sign Interactive UI",
      role: "USER",
      accountType: "BASIC",
      subscription: {
        planType: "FREE",
        status: "FREE",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
    } as unknown as T;
  }

  if (url.includes("/me/subscription")) {
    return {
      planType: "MONTHLY",
      status: "FREE",
      remainingDays: 0,
    } as unknown as T;
  }

  if (url.includes("/me/payments")) {
    return [] as unknown as T;
  }

  if (url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/google")) {
    return {
      accessToken: "demo-jwt-token-vsign",
      user: {
        id: "demo-user-1",
        email: "demo@vsign.vn",
        displayName: "Demo User",
        fullName: "Demo User",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser",
        role: "USER",
        accountType: "BASIC",
      },
    } as unknown as T;
  }

  // Units
  if (url === "/units" || url.startsWith("/units?")) {
    return {
      units: [
        {
          unitId: "unit-1",
          title: "Bài 1: Nhập môn VSL & Chào hỏi",
          description: "Học các ký hiệu chào hỏi cơ bản và cách xưng hô giao tiếp hằng ngày.",
          thumbnailUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
          chapterCount: 3,
          orderIndex: 1,
        },
        {
          unitId: "unit-2",
          title: "Bài 2: Gia đình & Xã hội",
          description: "Ký hiệu về các thành viên trong gia đình, mối quan hệ và cảm xúc.",
          thumbnailUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&q=80",
          chapterCount: 3,
          orderIndex: 2,
        },
        {
          unitId: "unit-3",
          title: "Bài 3: Trường học & Ẩm thực",
          description: "Dụng cụ học tập, đồ ăn, đồ uống quen thuộc với người Việt.",
          thumbnailUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80",
          chapterCount: 3,
          orderIndex: 3,
        },
      ],
    } as unknown as T;
  }

  // Chapters
  if (url.includes("/chapters") && !url.includes("/lessons")) {
    return {
      chapters: [
        {
          chapterId: "chap-1",
          title: "Chương 1: Ký hiệu Chào hỏi & Cảm ơn",
          description: "Chào hỏi, cảm ơn, tạm biệt",
          lessonCount: 3,
          orderIndex: 1,
          requiresPremium: false,
          locked: false,
          completionPercent: 100,
        },
        {
          chapterId: "chap-2",
          title: "Chương 2: Xưng hô người thân",
          description: "Bố, mẹ, anh, chị, em",
          lessonCount: 3,
          orderIndex: 2,
          requiresPremium: false,
          locked: false,
          completionPercent: 50,
        },
        {
          chapterId: "chap-3",
          title: "Chương 3: Cảm xúc & Giao tiếp",
          description: "Vui vẻ, buồn, hoảng sợ",
          lessonCount: 3,
          orderIndex: 3,
          requiresPremium: false,
          locked: false,
          completionPercent: 0,
        },
      ],
    } as unknown as T;
  }

  // Lessons list in a chapter
  if (url.includes("/lessons") && url.includes("/chapters/")) {
    return {
      lessons: [
        {
          lessonId: "lesson-1",
          title: "Xin chào & Cảm ơn",
          description: "Học cách chào và cảm ơn chuẩn VSL",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSeconds: 180,
          orderIndex: 1,
          requiresPremium: false,
          locked: false,
          status: "COMPLETED",
        },
        {
          lessonId: "lesson-2",
          title: "Thành viên trong Gia đình",
          description: "Ký hiệu Bố, Mẹ, Anh chị em",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSeconds: 240,
          orderIndex: 2,
          requiresPremium: false,
          locked: false,
          status: "IN_PROGRESS",
        },
        {
          lessonId: "lesson-3",
          title: "Cô giáo & Thầy giáo",
          description: "Ký hiệu xưng hô trường học",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          durationSeconds: 200,
          orderIndex: 3,
          requiresPremium: false,
          locked: false,
          status: "NOT_STARTED",
        },
      ],
    } as unknown as T;
  }

  // Single Lesson detail
  if (url.includes("/lessons/") && !url.endsWith("/quiz") && !url.endsWith("/progress") && !url.endsWith("/complete")) {
    const parts = url.split("/");
    const lessonId = parts[parts.indexOf("lessons") + 1] || "lesson-1";
    return {
      lessonId,
      title: "Xin chào & Cảm ơn (Demo)",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      requiresPremium: false,
      progress: {
        lessonId,
        completionPct: 100,
        lastPositionSeconds: 180,
        phase: "PRACTICE",
        status: "COMPLETED",
      },
    } as unknown as T;
  }

  // Lesson quiz
  if (url.endsWith("/quiz")) {
    return {
      lessonId: "lesson-1",
      quizId: "quiz-demo-1",
      attemptId: "attempt-demo-1",
      questions: [
        {
          id: "q1",
          prompt: "Ký hiệu nào dưới đây thể hiện sự 'Cảm ơn'?",
          options: [
            { id: "opt1", text: "Chắp hai tay trước ngực và cúi đầu nhẹ" },
            { id: "opt2", text: "Vẫy tay sang hai bên" },
            { id: "opt3", text: "Đưa ngón tay trỏ lên môi" },
            { id: "opt4", text: "Vỗ hai bàn tay vào nhau" },
          ],
          correctAnswerId: "opt1",
        },
        {
          id: "q2",
          prompt: "Ký hiệu 'Xin chào' trong VSL thường sử dụng bàn tay như thế nào?",
          options: [
            { id: "opt1", text: "Bàn tay mở hướng về phía trước, di chuyển nhẹ" },
            { id: "opt2", text: "Nắm chặt bàn tay" },
            { id: "opt3", text: "Chỉ ngón tay cái lên trên" },
            { id: "opt4", text: "Xòe 5 ngón tay úp xuống đất" },
          ],
          correctAnswerId: "opt1",
        },
      ],
    } as unknown as T;
  }

  // Quiz submission
  if (url.includes("/quiz-attempts/")) {
    return {
      attemptId: "attempt-demo-1",
      score: 100,
      passed: true,
      xpAwarded: 20,
      reviewAvailable: true,
      timedOut: false,
      unansweredCount: 0,
    } as unknown as T;
  }

  // Practice items list
  if (url.includes("/learning/practice-items")) {
    return {
      page: 0,
      size: 20,
      total: 8,
      totalPages: 1,
      content: [
        { itemId: "practice-school-co-giao", lessonId: "lesson-3", label: "co_giao", category: "school", level: "Beginner", expectedGloss: "CO_GIAO", videoUrl: "" },
        { itemId: "practice-mvp-bo", lessonId: "lesson-2", label: "bo", category: "family", level: "Beginner", expectedGloss: "BO", videoUrl: "" },
        { itemId: "practice-mvp-me", lessonId: "lesson-2", label: "me", category: "family", level: "Beginner", expectedGloss: "ME", videoUrl: "" },
        { itemId: "practice-mvp-anhhai", lessonId: "lesson-2", label: "anhhai", category: "family", level: "Beginner", expectedGloss: "ANHHAI", videoUrl: "" },
        { itemId: "practice-mvp-caphe", lessonId: "lesson-3", label: "ca_phe", category: "beverage", level: "Beginner", expectedGloss: "CA_PHE", videoUrl: "" },
        { itemId: "practice-mvp-banhmi", lessonId: "lesson-3", label: "banhmi", category: "food", level: "Beginner", expectedGloss: "BANHMI", videoUrl: "" },
        { itemId: "practice-mvp-vuive", lessonId: "lesson-1", label: "vuive", category: "emotion", level: "Beginner", expectedGloss: "VUIVE", videoUrl: "" },
        { itemId: "practice-mvp-buon", lessonId: "lesson-1", label: "buon", category: "emotion", level: "Beginner", expectedGloss: "BUON", videoUrl: "" },
      ],
    } as unknown as T;
  }

  // Dictionary entries
  if (url.includes("/dictionary")) {
    return {
      items: [
        { id: 1, entryId: "dict-1", word: "Cô giáo", category: "Trường học", difficulty: "Cơ bản", difficultyLevel: 1, description: "Ký hiệu chỉ cô giáo dạy học trong nhà trường." },
        { id: 2, entryId: "dict-2", word: "Bố", category: "Gia đình", difficulty: "Cơ bản", difficultyLevel: 1, description: "Ký hiệu chỉ người cha trong gia đình." },
        { id: 3, entryId: "dict-3", word: "Mẹ", category: "Gia đình", difficulty: "Cơ bản", difficultyLevel: 1, description: "Ký hiệu chỉ người mẹ trong gia đình." },
        { id: 4, entryId: "dict-4", word: "Anh hai", category: "Gia đình", difficulty: "Cơ bản", difficultyLevel: 1, description: "Ký hiệu chỉ anh trai lớn trong gia đình." },
        { id: 5, entryId: "dict-5", word: "Cà phê", category: "Đồ uống", difficulty: "Cơ bản", difficultyLevel: 1, description: "Ký hiệu mô tả thức uống cà phê." },
        { id: 6, entryId: "dict-6", word: "Bánh mì", category: "Ẩm thực", difficulty: "Cơ bản", difficultyLevel: 1, description: "Ký hiệu món ăn bánh mì Việt Nam." },
        { id: 7, entryId: "dict-7", word: "Vui sướng", category: "Cảm xúc", difficulty: "Cơ bản", difficultyLevel: 1, description: "Ký hiệu thể hiện niềm vui, sự sướng vui." },
        { id: 8, entryId: "dict-8", word: "Buồn thảm", category: "Cảm xúc", difficulty: "Cơ bản", difficultyLevel: 1, description: "Ký hiệu thể hiện tâm trạng buồn bã." },
      ],
    } as unknown as T;
  }

  // Gamification summary
  if (url.includes("/gamification/summary")) {
    return {
      userId: "demo-user-1",
      totalXp: 350,
      currentStreak: 5,
      longestStreak: 12,
      badges: [
        { badgeId: "b1", name: "Người khởi đầu", earnedAt: "2026-06-01" },
        { badgeId: "b2", name: "Streak 5 ngày", earnedAt: "2026-06-05" },
      ],
    } as unknown as T;
  }

  // XP awards
  if (url.includes("/gamification/xp-awards")) {
    return {
      userId: "demo-user-1",
      eventId: "event-demo-1",
      totalXp: 370,
      xpAwarded: 20,
      duplicate: false,
    } as unknown as T;
  }

  // Leaderboards
  if (url.includes("/leaderboards")) {
    return {
      period: "WEEKLY",
      page: 0,
      size: 20,
      entries: [
        { rank: 1, userId: "user-101", fullName: "Nguyễn Văn An", xp: 1250, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=An" },
        { rank: 2, userId: "user-102", fullName: "Trần Thị Bình", xp: 980, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Binh" },
        { rank: 3, userId: "demo-user-1", fullName: "Demo User (Bạn)", xp: 350, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser" },
        { rank: 4, userId: "user-103", fullName: "Lê Minh Cường", xp: 290, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong" },
        { rank: 5, userId: "user-104", fullName: "Phạm Hoàng Dung", xp: 210, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung" },
      ],
      currentUser: {
        rank: 3,
        userId: "demo-user-1",
        fullName: "Demo User (Bạn)",
        xp: 350,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser",
      },
    } as unknown as T;
  }

  // Signature attempts
  if (url.includes("/signature-workflows/attempts")) {
    return {
      attemptId: "attempt-demo-" + Date.now(),
      practiceItemId: "practice-item-1",
      status: "PASSED",
      score: 92,
      targetGloss: "CO_GIAO",
      predictedGloss: "CO_GIAO",
      confidence: 0.92,
      correct: true,
      feedbackCodes: ["SUCCESS"],
      currentUsage: 1,
      maxLimit: 10,
    } as unknown as T;
  }

  // Assessments
  if (url === "/assessments") {
    return [
      { id: "asm-1", title: "Bài kiểm tra Đánh giá Năng lực VSL Sơ cấp", questionCount: 5, passingScore: 80 },
    ] as unknown as T;
  }

  if (url.includes("/assessments/")) {
    if (url.endsWith("/submissions")) {
      return {
        assessmentId: "asm-1",
        userId: "demo-user-1",
        score: 100,
        passed: true,
        correctAnswers: 5,
        totalQuestions: 5,
        awardedXp: 50,
      } as unknown as T;
    }
    return {
      id: "asm-1",
      title: "Bài kiểm tra Đánh giá Năng lực VSL Sơ cấp",
      passingScore: 80,
      questions: [
        {
          id: "aq1",
          prompt: "Ý nghĩa của ký hiệu 'Bố' trong gia đình VSL là gì?",
          options: [
            { id: "ao1", text: "Đặt ngón tay trỏ chạm cằm hoặc trán" },
            { id: "ao2", text: "Vẫy tay hai bên" },
            { id: "ao3", text: "Búng hai ngón tay" },
          ],
          correctAnswerId: "ao1",
        },
      ],
    } as unknown as T;
  }

  // Admin APIs
  if (url.includes("/admin/metrics/overview")) {
    return {
      totalUsers: 142,
      newUsers: 18,
      activeUsers: 95,
      activeUsersInRange: 95,
      premiumUsers: 24,
      totalRevenueVnd: 5940000,
      successfulPayments: 24,
      pendingReviews: 0,
      lessonCompletions: 480,
      quizAttempts: 310,
      aiAttempts: 210,
      aiSuccessRate: 88.5,
      averageActiveSeconds: 1800,
      topActiveUsers: [
        { email: "demo@vsign.vn", displayName: "Demo User", activeSeconds: 7200 },
        { email: "user1@vsign.vn", displayName: "Nguyễn Văn An", activeSeconds: 5400 },
      ],
    } as unknown as T;
  }

  if (url.includes("/admin/metrics/usage")) {
    return {
      granularity: "WEEKLY",
      points: [
        { date: "2026-06-15", activeSeconds: 3600, lessonCompletions: 40, quizAttempts: 25, aiAttempts: 20 },
        { date: "2026-06-22", activeSeconds: 4200, lessonCompletions: 55, quizAttempts: 35, aiAttempts: 30 },
        { date: "2026-06-29", activeSeconds: 5100, lessonCompletions: 70, quizAttempts: 48, aiAttempts: 42 },
        { date: "2026-07-06", activeSeconds: 6800, lessonCompletions: 95, quizAttempts: 65, aiAttempts: 58 },
      ],
    } as unknown as T;
  }

  if (url.includes("/admin/users")) {
    return {
      users: [
        { id: "u-1", email: "demo@vsign.vn", displayName: "Demo User", role: "USER", status: "ACTIVE", accountType: "BASIC", createdAt: "2026-06-15T08:00:00Z", totalXp: 350, currentStreak: 5 },
        { id: "u-2", email: "admin@vsign.vn", displayName: "V-Sign Admin", role: "SUPER_ADMIN", status: "ACTIVE", accountType: "PREMIUM", createdAt: "2026-06-01T08:00:00Z", totalXp: 1200, currentStreak: 15 },
        { id: "u-3", email: "nguyenvana@gmail.com", displayName: "Nguyễn Văn An", role: "USER", status: "ACTIVE", accountType: "PREMIUM", createdAt: "2026-06-18T10:30:00Z", totalXp: 980, currentStreak: 8 },
        { id: "u-4", email: "tranbinh@gmail.com", displayName: "Trần Thị Bình", role: "USER", status: "ACTIVE", accountType: "BASIC", createdAt: "2026-06-20T14:15:00Z", totalXp: 450, currentStreak: 3 },
      ],
      page: 0,
      size: 20,
      total: 4,
      totalPages: 1,
    } as unknown as T;
  }

  if (url.includes("/admin/payments")) {
    return {
      payments: [
        { transactionId: "tx-101", userEmail: "nguyenvana@gmail.com", planId: "MONTHLY", amount: 99000, currency: "VND", status: "SUCCESS", provider: "PAYOS", createdAt: "2026-06-18T10:30:00Z", updatedAt: "2026-06-18T10:31:00Z" },
        { transactionId: "tx-102", userEmail: "admin@vsign.vn", planId: "YEARLY", amount: 799000, currency: "VND", status: "SUCCESS", provider: "PAYOS", createdAt: "2026-06-01T08:00:00Z", updatedAt: "2026-06-01T08:01:00Z" },
      ],
      page: 0,
      size: 10,
      total: 2,
      totalPages: 1,
    } as unknown as T;
  }

  if (url.includes("/admin/audit-logs")) {
    return [
      { id: "log-1", actorEmail: "admin@vsign.vn", action: "USER_UPDATE", targetType: "USER", targetId: "u-3", reason: "Nâng cấp gói Premium", createdAt: "2026-06-18T10:31:00Z" },
    ] as unknown as T;
  }

  // Subscription plans & orders
  if (url.includes("/subscription/plans")) {
    return [
      { planId: "plan-monthly", planType: "MONTHLY", name: "Gói Giao Tiếp (Hàng Tháng)", amount: 99000, price: 99000, currency: "VND", durationDays: 30 },
      { planId: "plan-yearly", planType: "YEARLY", name: "Gói Thành Thạo (Hàng Năm)", amount: 799000, price: 799000, currency: "VND", durationDays: 365 },
    ] as unknown as T;
  }

  if (url.includes("/payments/orders")) {
    return {
      transactionId: "ord-demo-" + Date.now(),
      providerTransactionId: "payos-" + Date.now(),
      provider: "MOMO",
      planType: "MONTHLY",
      amount: 99000,
      currency: "VND",
      status: "SUCCESS",
      qrCodeData: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VSIGN_DEMO_PAYMENT",
      deepLink: "#",
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
    } as unknown as T;
  }

  return (Array.isArray(path) ? [] : {}) as unknown as T;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status >= 500) {
        return getMockFallbackData<T>(path, init);
      }
      if ((response.status === 401 || payload?.code === "UNAUTHORIZED") && payload?.code !== "INVALID_CREDENTIALS") {
        handleUnauthorizedResponse();
      }
      const validationErrors = normalizeValidationErrors(payload?.validationErrors);
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        throw makeApiError(payload?.code || "HTTP_ERROR", payload?.message || "API request failed", validationErrors);
      }
      throw makeApiError(payload?.code || "HTTP_ERROR", payload?.message || "Không thể kết nối máy chủ.");
    }

    return payload?.data ?? payload;
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error as ApiErrorShape)?.code === "HTTP_ERROR" ||
      (error as Error)?.name === "TypeError"
    ) {
      return getMockFallbackData<T>(path, init);
    }
    throw error;
  }
}

function authHeader(token: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeAccountType(value?: string): AccountType {
  if (value === "PREMIUM" || value === "ADMIN") return value;
  return "BASIC";
}

function normalizeRole(value?: string): UserRole {
  if (value === "ADMIN" || value === "SUPER_ADMIN" || value === "CONTENT_REVIEWER") return value;
  return "USER";
}

function normalizePaymentStatus(value?: string): PaymentStatus {
  switch (value) {
    case "PAID":
    case "SUCCESS":
      return "SUCCESS";
    case "FAILED":
    case "CANCELED":
    case "CANCELLED":
    case "REFUNDED":
      return "FAILED";
    case "TIMEOUT":
      return "TIMEOUT";
    default:
      return "PENDING";
  }
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? value as ApiRecord : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeProvider(value: unknown): PaymentProvider {
  return value === "ZALOPAY" ? "ZALOPAY" : "MOMO";
}

function normalizePlanType(value: unknown): PlanType {
  return value === "YEARLY" ? "YEARLY" : "MONTHLY";
}

function toAuthUser(raw: unknown): AuthUserDto {
  const record = asRecord(raw);
  const email = asString(record.email);
  const displayName = asString(record.displayName, asString(record.fullName, email));
  const subRecord = record.subscription ? asRecord(record.subscription) : undefined;
  return {
    id: String(record.id || ""),
    email,
    displayName,
    fullName: asString(record.fullName, displayName),
    avatarUrl: asString(record.avatarUrl),
    bio: asString(record.bio),
    role: normalizeRole(asString(record.role, "USER")),
    accountType: normalizeAccountType(asString(record.accountType)),
    subscription: subRecord ? {
      planType: asString(subRecord.planType, "FREE"),
      status: asString(subRecord.status, "INACTIVE"),
      startDate: asString(subRecord.startDate),
      endDate: asString(subRecord.endDate),
    } : undefined,
  };
}

function toAuthSession(raw: unknown): AuthSessionDto {
  const record = asRecord(raw);
  return {
    accessToken: asString(record.accessToken),
    user: toAuthUser(record.user),
  };
}

function toPaymentPlan(raw: unknown): PaymentPlan | null {
  const record = asRecord(raw);
  if (record.planType !== "MONTHLY" && record.planType !== "YEARLY") return null;
  const planType = record.planType;
  return {
    planId: asString(record.planId) || undefined,
    planType,
    name: asString(record.name, planType),
    amount: typeof record.amount === "number" ? record.amount : undefined,
    price: asNumber(record.price, asNumber(record.amount)),
    currency: "VND",
    durationDays: asNumber(record.durationDays, planType === "YEARLY" ? 365 : 30),
  };
}

function toPaymentOrder(raw: unknown): PaymentOrderResponse {
  const record = asRecord(raw);
  return {
    transactionId: asString(record.transactionId),
    providerTransactionId: asString(record.providerTransactionId),
    provider: normalizeProvider(record.provider),
    planType: normalizePlanType(record.planType),
    amount: asNumber(record.amount),
    currency: "VND",
    status: normalizePaymentStatus(asString(record.status)),
    qrCodeData: asString(record.qrCodeData),
    deepLink: asString(record.deepLink),
    expiresAt: asString(record.expiresAt, new Date(Date.now() + 5 * 60 * 1000).toISOString()),
  };
}

function toPaymentTransaction(raw: unknown): PaymentTransaction {
  const record = asRecord(raw);
  return {
    ...toPaymentOrder(raw),
    createdAt: asString(record.createdAt, new Date().toISOString()),
    retryable: asBoolean(record.retryable),
  };
}

function normalizeAdminUserStatus(value: unknown): AdminUserDto["status"] {
  return value === "DISABLED" ? "DISABLED" : "ACTIVE";
}

function toAdminUser(raw: unknown): AdminUserDto {
  const record = asRecord(raw);
  return {
    id: asString(record.id),
    email: asString(record.email),
    displayName: asString(record.displayName, asString(record.fullName, asString(record.email))),
    role: normalizeRole(asString(record.role)),
    status: normalizeAdminUserStatus(record.status),
    accountType: normalizeAccountType(asString(record.accountType)),
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt) || undefined,
    lastSeenAt: asString(record.lastSeenAt) || null,
    totalXp: asNumber(record.totalXp),
    currentStreak: asNumber(record.currentStreak),
  };
}

function toAdminUserActivity(raw: unknown): AdminUserActivityDto {
  const record = asRecord(raw);
  return {
    activeSeconds: asNumber(record.activeSeconds),
    completedLessons: asNumber(record.completedLessons),
    quizAttempts: asNumber(record.quizAttempts),
    aiAttempts: asNumber(record.aiAttempts),
    aiPassedAttempts: asNumber(record.aiPassedAttempts),
    lastSeenAt: asString(record.lastSeenAt) || null,
  };
}

function toAdminUserDetail(raw: unknown): AdminUserDetailDto {
  const record = asRecord(raw);
  return {
    user: toAdminUser(record.user),
    activity: toAdminUserActivity(record.activity),
  };
}

function toAdminUserList(raw: unknown): AdminUserListDto {
  const record = asRecord(raw);
  const users = asArray(record.users).map(toAdminUser);
  return {
    users,
    page: asNumber(record.page),
    size: asNumber(record.size, users.length),
    total: asNumber(record.total, users.length),
    totalPages: asNumber(record.totalPages, 1),
  };
}

function toAdminMetricsOverview(raw: unknown): AdminMetricsOverviewDto {
  const record = asRecord(raw);
  return {
    totalUsers: asNumber(record.totalUsers),
    newUsers: asNumber(record.newUsers),
    activeUsers: asNumber(record.activeUsers),
    activeUsersInRange: asNumber(record.activeUsersInRange),
    premiumUsers: asNumber(record.premiumUsers),
    totalRevenueVnd: asNumber(record.totalRevenueVnd),
    successfulPayments: asNumber(record.successfulPayments),
    pendingReviews: asNumber(record.pendingReviews),
    lessonCompletions: asNumber(record.lessonCompletions),
    quizAttempts: asNumber(record.quizAttempts),
    aiAttempts: asNumber(record.aiAttempts),
    aiSuccessRate: asNumber(record.aiSuccessRate),
    averageActiveSeconds: asNumber(record.averageActiveSeconds),
    topActiveUsers: asArray(record.topActiveUsers).map((item) => {
      const top = asRecord(item);
      return {
        email: asString(top.email),
        displayName: asString(top.displayName, asString(top.email)),
        activeSeconds: asNumber(top.activeSeconds),
      };
    }),
  };
}

function toAdminUsageMetrics(raw: unknown): AdminUsageMetricsDto {
  const record = asRecord(raw);
  return {
    granularity: asString(record.granularity, "daily"),
    points: asArray(record.points).map((item) => {
      const point = asRecord(item);
      return {
        date: asString(point.date),
        activeSeconds: asNumber(point.activeSeconds),
        lessonCompletions: asNumber(point.lessonCompletions),
        quizAttempts: asNumber(point.quizAttempts),
        aiAttempts: asNumber(point.aiAttempts),
      };
    }),
  };
}

function toAdminPaymentRecord(raw: unknown): AdminPaymentRecordDto {
  const record = asRecord(raw);
  return {
    transactionId: asString(record.transactionId),
    userEmail: asString(record.userEmail),
    planId: asString(record.planId),
    amount: asNumber(record.amount),
    currency: "VND",
    status: asString(record.status),
    provider: asString(record.provider),
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt),
    overrideReason: asString(record.overrideReason) || undefined,
  };
}

function toAdminPaymentPage(raw: unknown): AdminPaymentPageDto {
  const record = asRecord(raw);
  const payments = asArray(record.payments).map(toAdminPaymentRecord);
  return {
    payments,
    page: asNumber(record.page),
    size: asNumber(record.size, payments.length),
    total: asNumber(record.total, payments.length),
    totalPages: asNumber(record.totalPages, 1),
  };
}

function toAdminAuditLog(raw: unknown): AdminAuditLogDto {
  const record = asRecord(raw);
  return {
    id: asString(record.id),
    actorEmail: asString(record.actorEmail),
    action: asString(record.action),
    targetType: asString(record.targetType),
    targetId: asString(record.targetId),
    reason: asString(record.reason) || undefined,
    createdAt: asString(record.createdAt),
  };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toUnitSummary(raw: unknown): UnitSummaryDto {
  const record = asRecord(raw);
  return {
    unitId: asString(record.unitId),
    title: asString(record.title),
    description: asString(record.description),
    thumbnailUrl: asString(record.thumbnailUrl) || undefined,
    chapterCount: asNumber(record.chapterCount),
    orderIndex: asNumber(record.orderIndex),
  };
}

function toChapterSummary(raw: unknown): ChapterSummaryDto {
  const record = asRecord(raw);
  return {
    chapterId: asString(record.chapterId),
    title: asString(record.title),
    description: asString(record.description),
    lessonCount: asNumber(record.lessonCount),
    orderIndex: asNumber(record.orderIndex),
    requiresPremium: Boolean(record.requiresPremium),
    locked: Boolean(record.locked),
    completionPercent: asNumber(record.completionPercent),
  };
}

function normalizeProgressStatus(value: unknown): LessonProgressDto["status"] {
  if (value === "COMPLETED" || value === "IN_PROGRESS") return value;
  return "NOT_STARTED";
}

function toLessonProgress(raw: unknown, lessonId = ""): LessonProgressDto {
  const record = asRecord(raw);
  return {
    lessonId: asString(record.lessonId, lessonId),
    completionPct: asNumber(record.completionPct),
    lastPositionSeconds: asNumber(record.lastPositionSeconds),
    phase: asString(record.phase, "VIDEO"),
    currentQuestionIndex: typeof record.currentQuestionIndex === "number" ? record.currentQuestionIndex : null,
    status: normalizeProgressStatus(record.status),
  };
}

function toLessonSummary(raw: unknown): LessonSummaryDto {
  const record = asRecord(raw);
  const lessonId = asString(record.lessonId);
  return {
    lessonId,
    title: asString(record.title),
    description: asString(record.description),
    videoUrl: asString(record.videoUrl) || undefined,
    durationSeconds: asNumber(record.durationSeconds),
    orderIndex: asNumber(record.orderIndex),
    requiresPremium: Boolean(record.requiresPremium),
    locked: Boolean(record.locked),
    status: normalizeProgressStatus(record.status),
  };
}

function toPracticeItemSummary(raw: unknown): PracticeItemSummaryDto {
  const record = asRecord(raw);
  return {
    itemId: asString(record.itemId),
    lessonId: asString(record.lessonId),
    label: asString(record.label),
    category: asString(record.category),
    level: asString(record.level),
    expectedGloss: asString(record.expectedGloss),
    sourceVideoFile: asString(record.sourceVideoFile) || undefined,
    videoUrl: asString(record.videoUrl) || undefined,
  };
}

function toPracticeItemsPage(raw: unknown): PracticeItemsPageDto {
  const record = asRecord(raw);
  const content = asArray(record.content).map(toPracticeItemSummary);
  return {
    page: asNumber(record.page),
    size: asNumber(record.size, content.length),
    total: asNumber(record.total, content.length),
    totalPages: asNumber(record.totalPages, 1),
    content,
  };
}

function toLessonDetail(raw: unknown): LessonDetailDto {
  const record = asRecord(raw);
  const lessonId = asString(record.lessonId);
  return {
    lessonId,
    title: asString(record.title),
    videoUrl: asString(record.videoUrl) || undefined,
    requiresPremium: Boolean(record.requiresPremium),
    progress: toLessonProgress(record.progress, lessonId),
  };
}

function toLessonQuiz(raw: unknown): LessonQuizDto {
  const record = asRecord(raw);
  return {
    lessonId: asString(record.lessonId),
    quizId: asString(record.quizId),
    attemptId: asString(record.attemptId),
    questions: asArray(record.questions).map((question) => {
      const questionRecord = asRecord(question);
      return {
        id: asString(questionRecord.id),
        prompt: asString(questionRecord.prompt),
        options: asArray(questionRecord.options).map((option) => {
          const optionRecord = asRecord(option);
          return {
            id: asString(optionRecord.id),
            text: asString(optionRecord.text),
            videoUrl: asString(optionRecord.videoUrl) || undefined,
          };
        }),
        correctAnswerId: asString(questionRecord.correctAnswerId) || null,
      };
    }),
  };
}

function toDictionaryEntry(raw: unknown): DictionaryEntryDto {
  const record = asRecord(raw);
  return {
    id: asNumber(record.id),
    entryId: asString(record.entryId),
    word: asString(record.word, asString(record.keyword)),
    keyword: asString(record.keyword),
    category: asString(record.category),
    difficulty: asString(record.difficulty),
    difficultyLevel: asNumber(record.difficultyLevel),
    description: asString(record.description),
    videoUrl: asString(record.videoUrl) || undefined,
    thumbnailUrl: asString(record.thumbnailUrl) || undefined,
  };
}

function toAssessmentSummary(raw: unknown): AssessmentSummaryDto {
  const record = asRecord(raw);
  return {
    id: asString(record.id),
    title: asString(record.title),
    questionCount: asNumber(record.questionCount),
    passingScore: asNumber(record.passingScore),
  };
}

function toAssessmentDetail(raw: unknown): AssessmentDetailDto {
  const record = asRecord(raw);
  return {
    id: asString(record.id),
    title: asString(record.title),
    passingScore: asNumber(record.passingScore),
    questions: asArray(record.questions).map((question) => {
      const questionRecord = asRecord(question);
      return {
        id: asString(questionRecord.id),
        prompt: asString(questionRecord.prompt),
        options: asArray(questionRecord.options).map((option) => {
          const optionRecord = asRecord(option);
          return {
            id: asString(optionRecord.id),
            text: asString(optionRecord.text),
            videoUrl: asString(optionRecord.videoUrl) || undefined,
          };
        }),
        correctAnswerId: asString(questionRecord.correctAnswerId) || null,
      };
    }),
  };
}

export const authApi = {
  async register(input: RegisterRequest): Promise<AuthSessionDto> {
    const raw = await requestJson<unknown>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toAuthSession(raw);
  },

  async login(input: LoginRequest): Promise<AuthSessionDto> {
    const raw = await requestJson<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toAuthSession(raw);
  },

  async updateProfile(token: string, input: Partial<AuthUserDto>): Promise<AuthUserDto> {
    const raw = await requestJson<unknown>("/me/profile", {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(input),
    });
    return toAuthUser(raw);
  },

  async changePassword(token: string, input: ChangePasswordRequest): Promise<void> {
    await requestJson<void>("/me/change-password", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(input),
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await requestJson<void>("/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  },

  async completePasswordReset(input: CompleteResetPasswordRequest): Promise<void> {
    await requestJson<void>("/auth/password-reset/complete", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async recordHeartbeat(token: string, activeSeconds = 60): Promise<void> {
    await requestJson<void>("/me/activity/heartbeat", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ activeSeconds }),
    });
  },

  async getMe(token: string): Promise<AuthUserDto> {
    const raw = await requestJson<unknown>("/me", {
      headers: authHeader(token),
    });
    return toAuthUser(raw);
  },
};

export const paymentApi = {
  async getPlans(): Promise<PaymentPlan[]> {
    const raw = await requestJson<unknown[]>("/subscription/plans");
    return raw.map(toPaymentPlan).filter((plan): plan is PaymentPlan => Boolean(plan));
  },

  async createOrder(input: PaymentOrderRequest, token?: string): Promise<PaymentOrderResponse> {
    const raw = await requestJson<unknown>("/payments/orders", {
      method: "POST",
      headers: token ? authHeader(token) : undefined,
      body: JSON.stringify(input),
    });
    return toPaymentOrder(raw);
  },

  async getSubscription(token: string): Promise<SubscriptionSummary> {
    return requestJson<SubscriptionSummary>("/me/subscription", {
      headers: authHeader(token),
    });
  },

  async getPaymentHistory(token: string): Promise<PaymentTransaction[]> {
    const raw = await requestJson<unknown[]>("/me/payments", {
      headers: authHeader(token),
    });
    return raw.map(toPaymentTransaction);
  },

  async getPaymentStatus(transactionId: string, token?: string): Promise<PaymentTransaction> {
    const raw = await requestJson<unknown>(`/payments/${encodeURIComponent(transactionId)}`, {
      headers: token ? authHeader(token) : undefined,
    });
    return toPaymentTransaction(raw);
  },

  async recordPayment(_transaction: PaymentTransaction): Promise<void> {
    return;
  },
};

export const adminApi = {
  async getMetricsOverview(token: string, input: { fromDate?: string; toDate?: string } = {}): Promise<AdminMetricsOverviewDto> {
    const params = new URLSearchParams();
    if (input.fromDate) params.set("fromDate", input.fromDate);
    if (input.toDate) params.set("toDate", input.toDate);
    const query = params.toString();
    const raw = await requestJson<unknown>(`/admin/metrics/overview${query ? `?${query}` : ""}`, {
      headers: authHeader(token),
    });
    return toAdminMetricsOverview(raw);
  },

  async getUsageMetrics(token: string, input: { fromDate?: string; toDate?: string; granularity?: string } = {}): Promise<AdminUsageMetricsDto> {
    const params = new URLSearchParams();
    if (input.fromDate) params.set("fromDate", input.fromDate);
    if (input.toDate) params.set("toDate", input.toDate);
    if (input.granularity) params.set("granularity", input.granularity);
    const query = params.toString();
    const raw = await requestJson<unknown>(`/admin/metrics/usage${query ? `?${query}` : ""}`, {
      headers: authHeader(token),
    });
    return toAdminUsageMetrics(raw);
  },

  async listUsers(token: string, input: { search?: string; role?: string; status?: string; page?: number; size?: number } = {}): Promise<AdminUserListDto> {
    const params = new URLSearchParams();
    if (input.search) params.set("search", input.search);
    if (input.role) params.set("role", input.role);
    if (input.status) params.set("status", input.status);
    params.set("page", String(input.page ?? 0));
    params.set("size", String(input.size ?? 20));
    const raw = await requestJson<unknown>(`/admin/users?${params.toString()}`, {
      headers: authHeader(token),
    });
    return toAdminUserList(raw);
  },

  async getUser(token: string, userId: string): Promise<AdminUserDetailDto> {
    const raw = await requestJson<unknown>(`/admin/users/${encodeURIComponent(userId)}`, {
      headers: authHeader(token),
    });
    return toAdminUserDetail(raw);
  },

  async updateUser(token: string, userId: string, input: AdminUserUpdateInput): Promise<AdminUserDetailDto> {
    const raw = await requestJson<unknown>(`/admin/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(input),
    });
    return toAdminUserDetail(raw);
  },

  async deactivateUser(token: string, userId: string, reason: string): Promise<AdminUserDetailDto> {
    const params = new URLSearchParams();
    if (reason) params.set("reason", reason);
    const raw = await requestJson<unknown>(`/admin/users/${encodeURIComponent(userId)}?${params.toString()}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
    return toAdminUserDetail(raw);
  },

  async listPayments(token: string, page = 0, size = 10): Promise<AdminPaymentPageDto> {
    const raw = await requestJson<unknown>(`/admin/payments?page=${page}&size=${size}`, {
      headers: authHeader(token),
    });
    return toAdminPaymentPage(raw);
  },

  async listAuditLogs(token: string): Promise<AdminAuditLogDto[]> {
    const raw = await requestJson<unknown[]>("/admin/audit-logs", {
      headers: authHeader(token),
    });
    return raw.map(toAdminAuditLog);
  },
};

export const gamificationApi = {
  async getSummary(token: string): Promise<GamificationSummary> {
    return requestJson<GamificationSummary>("/gamification/summary", {
      headers: authHeader(token),
    });
  },

  async awardXp(token: string, input: XpAwardRequest): Promise<XpAwardResult> {
    return requestJson<XpAwardResult>("/gamification/xp-awards", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(input),
    });
  },

  async getLeaderboard(token: string, period: LeaderboardPeriod): Promise<LeaderboardResponseDto> {
    return requestJson<LeaderboardResponseDto>(`/leaderboards?period=${period}&page=0&size=20`, {
      headers: authHeader(token),
    });
  },
};

export const learningApi = {
  async listUnits(): Promise<UnitSummaryDto[]> {
    const raw = await requestJson<unknown>("/units?page=0&size=100&publishedOnly=true");
    const record = asRecord(raw);
    return asArray(record.units).map(toUnitSummary).sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async listChapters(unitId: string, token?: string): Promise<ChapterSummaryDto[]> {
    const raw = await requestJson<unknown>(`/units/${encodeURIComponent(unitId)}/chapters`, {
      headers: token ? authHeader(token) : undefined,
    });
    const record = asRecord(raw);
    return asArray(record.chapters).map(toChapterSummary).sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async listLessons(chapterId: string, token?: string): Promise<LessonSummaryDto[]> {
    const raw = await requestJson<unknown>(`/chapters/${encodeURIComponent(chapterId)}/lessons`, {
      headers: token ? authHeader(token) : undefined,
    });
    const record = asRecord(raw);
    return asArray(record.lessons).map(toLessonSummary).sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async getLesson(lessonId: string, token?: string): Promise<LessonDetailDto> {
    const raw = await requestJson<unknown>(`/lessons/${encodeURIComponent(lessonId)}`, {
      headers: token ? authHeader(token) : undefined,
    });
    return toLessonDetail(raw);
  },

  async listPracticeItems(
    input: { category?: string; level?: string; page?: number; size?: number } = {},
    token?: string
  ): Promise<PracticeItemsPageDto> {
    const params = new URLSearchParams();
    params.set("page", String(input.page ?? 0));
    params.set("size", String(input.size ?? 100));
    if (input.category) params.set("category", input.category);
    if (input.level) params.set("level", input.level);
    const raw = await requestJson<unknown>(`/learning/practice-items?${params.toString()}`, {
      headers: token ? authHeader(token) : undefined,
    });
    return toPracticeItemsPage(raw);
  },

  async updateProgress(lessonId: string, input: LessonProgressRequest, token?: string): Promise<LessonProgressDto> {
    const raw = await requestJson<unknown>(`/lessons/${encodeURIComponent(lessonId)}/progress`, {
      method: "PUT",
      headers: token ? authHeader(token) : undefined,
      body: JSON.stringify(input),
    });
    return toLessonProgress(raw, lessonId);
  },

  async getLessonQuiz(lessonId: string, token?: string): Promise<LessonQuizDto | null> {
    try {
      const raw = await requestJson<unknown>(`/lessons/${encodeURIComponent(lessonId)}/quiz`, {
        headers: token ? authHeader(token) : undefined,
      });
      return toLessonQuiz(raw);
    } catch (error) {
      const apiError = error as Partial<ApiErrorShape>;
      if (apiError.code === "LESSON_NOT_FOUND" || apiError.code === "NOT_FOUND" || apiError.code === "HTTP_ERROR") {
        return null;
      }
      throw error;
    }
  },

  async submitLessonQuiz(
    attemptId: string,
    answers: Array<{ questionId: string; selectedAnswerId: string }>,
    durationSeconds: number,
    token?: string
  ): Promise<QuizSubmitResultDto> {
    return requestJson<QuizSubmitResultDto>(`/quiz-attempts/${encodeURIComponent(attemptId)}/submit`, {
      method: "POST",
      headers: token ? authHeader(token) : undefined,
      body: JSON.stringify({ answers, durationSeconds }),
    });
  },

  async completeLesson(lessonId: string, token?: string): Promise<LessonProgressDto> {
    const raw = await requestJson<unknown>(`/lessons/${encodeURIComponent(lessonId)}/complete`, {
      method: "POST",
      headers: token ? authHeader(token) : undefined,
    });
    return toLessonProgress(raw, lessonId);
  },
};

export const dictionaryApi = {
  async listEntries(input: { keyword?: string; category?: string; difficulty?: string; page?: number; size?: number } = {}): Promise<DictionaryEntryDto[]> {
    const params = new URLSearchParams();
    params.set("page", String(input.page ?? 0));
    params.set("size", String(input.size ?? 100));
    if (input.keyword) params.set("keyword", input.keyword);
    if (input.category) params.set("category", input.category);
    if (input.difficulty) params.set("difficulty", input.difficulty);

    const raw = await requestJson<unknown>(`/dictionary?${params.toString()}`);
    const record = asRecord(raw);
    const entries = asArray(record.items).length > 0 ? asArray(record.items) : asArray(record.content);
    return entries.map(toDictionaryEntry);
  },
};

export const assessmentApi = {
  async listAssessments(): Promise<AssessmentSummaryDto[]> {
    const raw = await requestJson<unknown>("/assessments");
    return asArray(raw).map(toAssessmentSummary);
  },

  async getAssessment(assessmentId: string): Promise<AssessmentDetailDto> {
    const raw = await requestJson<unknown>(`/assessments/${encodeURIComponent(assessmentId)}`);
    return toAssessmentDetail(raw);
  },

  async submitAssessment(
    assessmentId: string,
    userId: string,
    answers: Array<{ questionId: string; selectedAnswerId: string }>
  ): Promise<AssessmentSubmitResultDto> {
    return requestJson<AssessmentSubmitResultDto>(`/assessments/${encodeURIComponent(assessmentId)}/submissions`, {
      method: "POST",
      body: JSON.stringify({ userId, answers }),
    });
  },
};

export const signatureApi = {
  async submitAttempt(input: SignatureAttemptRequest, token?: string): Promise<SignatureAttemptResponse> {
    return requestJson<SignatureAttemptResponse>("/signature-workflows/attempts", {
      method: "POST",
      headers: token ? authHeader(token) : undefined,
      body: JSON.stringify(input),
    });
  },
};

export function getPaymentHistory(): PaymentTransaction[] {
  return [];
}

export function getDefaultSubscription(isPremium: boolean, planType: PlanType = "MONTHLY"): SubscriptionSummary {
  if (!isPremium) return { planType: null, status: "FREE", remainingDays: 0 };
  const durationDays = planType === "YEARLY" ? 365 : 30;
  const startedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();
  return { planType, status: "ACTIVE", startedAt, expiresAt, remainingDays: durationDays };
}
