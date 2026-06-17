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


async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
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
    const validationErrors = normalizeValidationErrors(payload?.validationErrors);
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      throw makeApiError(payload?.code || "HTTP_ERROR", payload?.message || "API request failed", validationErrors);
    }
    throw makeApiError(payload?.code || "HTTP_ERROR", payload?.message || "Không thể kết nối máy chủ.");
  }

  return payload?.data ?? payload;
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
  return {
    id: String(record.id || ""),
    email,
    displayName,
    fullName: asString(record.fullName, displayName),
    avatarUrl: asString(record.avatarUrl),
    bio: asString(record.bio),
    role: normalizeRole(asString(record.role, "USER")),
    accountType: normalizeAccountType(asString(record.accountType)),
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
