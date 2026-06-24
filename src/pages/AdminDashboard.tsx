import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BadgeDollarSign,
  Clock3,
  CreditCard,
  FileText,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminApi,
  AdminAuditLogDto,
  AdminMetricsOverviewDto,
  AdminPaymentPageDto,
  AdminUsageMetricsDto,
  AdminUserDetailDto,
  AdminUserListDto,
  AdminUserUpdateInput,
  AccountType,
  UserRole,
} from "@/services/vsignApi";

type AdminTab = "overview" | "users" | "payments" | "audit";

const tabs: Array<{ id: AdminTab; label: string; icon: typeof Activity }> = [
  { id: "overview", label: "Tổng quan", icon: Activity },
  { id: "users", label: "Người dùng", icon: Users },
  { id: "payments", label: "Thanh toán", icon: CreditCard },
  { id: "audit", label: "Nhật ký", icon: FileText },
];

const emptyOverview: AdminMetricsOverviewDto = {
  totalUsers: 0,
  newUsers: 0,
  activeUsers: 0,
  activeUsersInRange: 0,
  premiumUsers: 0,
  totalRevenueVnd: 0,
  successfulPayments: 0,
  pendingReviews: 0,
  lessonCompletions: 0,
  quizAttempts: 0,
  aiAttempts: 0,
  aiSuccessRate: 0,
  averageActiveSeconds: 0,
  topActiveUsers: [],
};

function todayMinus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatDuration(seconds: number) {
  if (!seconds) return "0 phút";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes} phút`;
  return `${hours} giờ ${minutes} phút`;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}


function apiMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "Không thể tải dữ liệu quản trị.";
}

function statusBadge(status: string) {
  if (status === "ACTIVE" || status === "PAID") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    USER: "Học viên",
    ADMIN: "Quản trị viên",
    SUPER_ADMIN: "Quản trị cấp cao",
    CONTENT_REVIEWER: "Duyệt nội dung",
  };
  return labels[role] || role;
}

function userStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Đang hoạt động",
    DISABLED: "Đã vô hiệu hóa",
    PENDING: "Đang chờ",
    PAID: "Đã thanh toán",
    FAILED: "Thất bại",
  };
  return labels[status] || status;
}

function accountTypeLabel(type: string) {
  const labels: Record<string, string> = {
    BASIC: "Cơ bản",
    PREMIUM: "Cao cấp",
    ADMIN: "Quản trị",
  };
  return labels[type] || type;
}

function Kpi({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-display font-bold text-foreground">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { accessToken, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [fromDate, setFromDate] = useState(todayMinus(30));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [overview, setOverview] = useState<AdminMetricsOverviewDto>(emptyOverview);
  const [usage, setUsage] = useState<AdminUsageMetricsDto>({ granularity: "daily", points: [] });
  const [users, setUsers] = useState<AdminUserListDto>({ users: [], page: 0, size: 20, total: 0, totalPages: 0 });
  const [payments, setPayments] = useState<AdminPaymentPageDto>({ payments: [], page: 0, size: 10, total: 0, totalPages: 0 });
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailDto | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [usersPage, setUsersPage] = useState(0);
  const [paymentsPage, setPaymentsPage] = useState(0);
  const [editForm, setEditForm] = useState({ displayName: "", accountType: "BASIC" as AccountType, role: "USER" as UserRole, active: true, reason: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canEditRoles = profile.role === "SUPER_ADMIN";

  const dateInput = useMemo(() => ({ fromDate, toDate }), [fromDate, toDate]);

  const revenueChartData = useMemo(() => {
    const dailyRevenue: Record<string, number> = {};
    payments.payments.forEach((p) => {
      if (p.status === "SUCCESS" || p.status === "PAID") {
        const date = p.createdAt.slice(0, 10);
        dailyRevenue[date] = (dailyRevenue[date] || 0) + p.amount;
      }
    });

    const dates = usage.points.map((p) => p.date);
    if (dates.length === 0) {
      const uniqueDates = Array.from(new Set(payments.payments.map((p) => p.createdAt.slice(0, 10)))).sort();
      dates.push(...uniqueDates);
    }

    let cumulative = 0;
    return dates.map((date) => {
      const daily = dailyRevenue[date] || 0;
      cumulative += daily;
      return {
        date: date.slice(5),
        daily,
        cumulative,
      };
    });
  }, [payments.payments, usage.points]);

  const userGrowthData = useMemo(() => {
    const dailyUsers: Record<string, number> = {};
    users.users.forEach((u) => {
      const date = u.createdAt?.slice(0, 10);
      if (date) {
        dailyUsers[date] = (dailyUsers[date] || 0) + 1;
      }
    });

    const dates = usage.points.map((p) => p.date);
    if (dates.length === 0) {
      const uniqueDates = Array.from(new Set(users.users.map((u) => u.createdAt?.slice(0, 10)).filter(Boolean))).sort();
      dates.push(...uniqueDates);
    }

    let count = Math.max(0, overview.totalUsers - users.users.length);
    return dates.map((date) => {
      const daily = dailyUsers[date] || 0;
      count += daily;
      return {
        date: date.slice(5),
        daily,
        cumulative: count,
      };
    });
  }, [users.users, usage.points, overview.totalUsers]);

  const calendarWeek = useMemo(() => {
    const days = [];
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        name: dayNames[i],
        dateNum: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      });
    }
    return days;
  }, []);


  const loadOverviewAndAudit = useCallback(async (showLoading = false) => {
    if (!accessToken) return;
    if (showLoading) setLoading(true);
    setError("");
    try {
      const [nextOverview, nextUsage, nextAudit] = await Promise.all([
        adminApi.getMetricsOverview(accessToken, dateInput),
        adminApi.getUsageMetrics(accessToken, { ...dateInput, granularity: "daily" }),
        adminApi.listAuditLogs(accessToken),
      ]);
      setOverview(nextOverview);
      setUsage(nextUsage);
      setAuditLogs(nextAudit);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [accessToken, dateInput]);

  const loadUsers = useCallback(async () => {
    if (!accessToken) return;
    try {
      const nextUsers = await adminApi.listUsers(accessToken, {
        search: userSearch,
        role: roleFilter,
        status: statusFilter,
        page: usersPage,
        size: 20,
      });
      setUsers(nextUsers);
    } catch (err) {
      setError(apiMessage(err));
    }
  }, [accessToken, userSearch, roleFilter, statusFilter, usersPage]);

  const loadPayments = useCallback(async () => {
    if (!accessToken) return;
    try {
      const nextPayments = await adminApi.listPayments(accessToken, paymentsPage, 10);
      setPayments(nextPayments);
    } catch (err) {
      setError(apiMessage(err));
    }
  }, [accessToken, paymentsPage]);

  const loadDashboard = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      await Promise.all([
        loadOverviewAndAudit(),
        loadUsers(),
        loadPayments(),
      ]);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, loadOverviewAndAudit, loadUsers, loadPayments]);

  useEffect(() => {
    void loadOverviewAndAudit(true);
  }, [loadOverviewAndAudit]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const selectUser = async (userId: string) => {
    if (!accessToken) return;
    setError("");
    try {
      const detail = await adminApi.getUser(accessToken, userId);
      setSelectedUser(detail);
      setEditForm({
        displayName: detail.user.displayName,
        accountType: detail.user.accountType,
        role: detail.user.role,
        active: detail.user.status === "ACTIVE",
        reason: "",
      });
      setActiveTab("users");
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const refreshUsers = () => {
    setUsersPage(0);
    if (usersPage === 0) {
      void loadUsers();
    }
  };

  const saveUser = async () => {
    if (!accessToken || !selectedUser) return;
    setSaving(true);
    setError("");
    try {
      const payload: AdminUserUpdateInput = {
        displayName: editForm.displayName,
        accountType: editForm.accountType,
        active: editForm.active,
        reason: editForm.reason || "Admin dashboard update",
      };
      if (canEditRoles) payload.role = editForm.role;
      const detail = await adminApi.updateUser(accessToken, selectedUser.user.id, payload);
      setSelectedUser(detail);
      await refreshUsers();
      setEditForm((prev) => ({ ...prev, reason: "" }));
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deactivateUser = async () => {
    if (!accessToken || !selectedUser) return;
    setSaving(true);
    setError("");
    try {
      const detail = await adminApi.deactivateUser(accessToken, selectedUser.user.id, editForm.reason || "Admin dashboard deactivate");
      setSelectedUser(detail);
      await refreshUsers();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-display font-bold text-foreground">Bảng điều khiển quản trị</h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-bold text-foreground hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Tải lại
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold ${
                active ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-border bg-card">
          <LoadingSpinner size="md" message="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
              {/* LEFT COLUMN: Main Dashboard content */}
              <div className="space-y-5 min-w-0">
                
                {/* Welcome & Subtitle Header Card */}
                <div className="card-pastel p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-primary/10">
                  <div className="space-y-1 z-10">
                    <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">Chào Quản trị viên, chúc một ngày tốt lành!</h2>
                    <p className="text-sm text-muted-foreground font-body">Xem nhanh số liệu thống kê và biểu đồ tăng trưởng toàn diện của hệ thống học tập V-Sign.</p>
                  </div>
                  <div className="absolute right-6 bottom-0 translate-y-3 opacity-15 pointer-events-none">
                    <ShieldCheck className="w-28 h-28 text-primary" />
                  </div>
                </div>

                {/* 3 KPI Horizontal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Revenue KPI */}
                  <div className="card-pastel p-5 flex flex-col justify-between min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-body font-bold text-muted-foreground uppercase tracking-wider">Tổng doanh thu</span>
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <BadgeDollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-display font-black text-foreground">{formatMoney(overview.totalRevenueVnd)}</span>
                      <span className="text-xs font-body text-emerald-600 flex items-center font-bold">
                        <ArrowUpRight className="w-3.5 h-3.5" /> 13.5%
                      </span>
                    </div>
                  </div>

                  {/* Users KPI */}
                  <div className="card-pastel p-5 flex flex-col justify-between min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-body font-bold text-muted-foreground uppercase tracking-wider">Tổng học viên</span>
                      <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-display font-black text-foreground">{overview.totalUsers}</span>
                      <span className="text-xs font-body text-primary flex items-center font-bold">
                        +{overview.newUsers} mới
                      </span>
                    </div>
                  </div>

                  {/* AI Scan KPI */}
                  <div className="card-pastel p-5 flex flex-col justify-between min-h-[110px]">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-body font-bold text-muted-foreground uppercase tracking-wider">Hoạt động AI</span>
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-display font-black text-foreground">{overview.aiAttempts} lần</span>
                      <span className="text-xs font-body text-emerald-600 flex items-center font-bold">
                        Tỉ lệ đạt: {overview.aiSuccessRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2 Growth Charts (Revenue & Users) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Revenue Growth Chart */}
                  <div className="card-pastel p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-primary/10 text-primary">Tăng trưởng</span>
                        <h3 className="font-display font-bold text-base text-foreground mt-1">Doanh thu & Giao dịch</h3>
                      </div>
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[220px] w-full">
                      {revenueChartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu giao dịch</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary, #D6336C)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="var(--color-primary, #D6336C)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "gray" }} />
                            <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "gray" }} />
                            <ChartTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-card border border-border p-2.5 rounded-xl shadow-lg text-xs font-body font-semibold">
                                      <p className="font-bold text-foreground mb-1">{payload[0].payload.date}</p>
                                      <p className="text-primary">Ngày: {formatMoney(payload[0].value as number)}</p>
                                      <p className="text-muted-foreground">Tích lũy: {formatMoney(payload[1].value as number)}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area type="monotone" dataKey="daily" stroke="var(--color-primary, #D6336C)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu ngày" />
                            <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--secondary))" strokeWidth={1.5} fillOpacity={0} name="Tích lũy" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* User Growth Chart */}
                  <div className="card-pastel p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-secondary/10 text-secondary">Tăng trưởng</span>
                        <h3 className="font-display font-bold text-base text-foreground mt-1">Đăng ký học viên</h3>
                      </div>
                      <Users className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="h-[220px] w-full">
                      {userGrowthData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu học viên</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "gray" }} />
                            <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "gray" }} />
                            <ChartTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-card border border-border p-2.5 rounded-xl shadow-lg text-xs font-body font-semibold">
                                      <p className="font-bold text-foreground mb-1">{payload[0].payload.date}</p>
                                      <p className="text-secondary font-semibold">Đăng ký mới: {payload[0].value} học viên</p>
                                      <p className="text-muted-foreground">Tổng tích lũy: {payload[1].value}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line type="monotone" dataKey="daily" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} name="Đăng ký mới" />
                            <Line type="monotone" dataKey="cumulative" stroke="var(--color-primary, #D6336C)" strokeWidth={2} dot={false} name="Tổng học viên" />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid for "Hệ thống học tập" (My Asset) and "Thời lượng hoạt động" (To-do List) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* System Assets (My Asset) */}
                  <div className="card-pastel p-5 flex flex-col">
                    <h3 className="font-display font-bold text-base text-foreground mb-4">Hệ thống học tập</h3>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <div className="rounded-2xl p-4 flex flex-col justify-between bg-primary/5 border border-primary/10">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <span className="block text-2xl font-display font-black text-foreground">{overview.lessonCompletions}</span>
                          <span className="text-[11px] text-muted-foreground font-body">Bài học hoàn thành</span>
                        </div>
                      </div>
                      <div className="rounded-2xl p-4 flex flex-col justify-between bg-secondary/5 border border-secondary/10">
                        <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                          <UserCog className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <span className="block text-2xl font-display font-black text-foreground">{overview.quizAttempts}</span>
                          <span className="text-[11px] text-muted-foreground font-body">Lượt kiểm tra Quiz</span>
                        </div>
                      </div>
                      <div className="rounded-2xl p-4 flex flex-col justify-between bg-amber-500/5 border border-amber-500/10">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <span className="block text-2xl font-display font-black text-foreground">+{overview.newUsers}</span>
                          <span className="text-[11px] text-muted-foreground font-body">Đăng ký mới kỳ này</span>
                        </div>
                      </div>
                      <div className="rounded-2xl p-4 flex flex-col justify-between bg-emerald-500/5 border border-emerald-500/10">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <span className="block text-2xl font-display font-black text-foreground">{overview.aiSuccessRate}%</span>
                          <span className="text-[11px] text-muted-foreground font-body">Tỉ lệ đạt quét AI</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily active seconds (To-do List representation) */}
                  <div className="card-pastel p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-base text-foreground">Thời lượng hoạt động</h3>
                      <span className="text-xs text-muted-foreground font-body">{usage.points.length} ngày gần nhất</span>
                    </div>
                    <div className="space-y-3.5 overflow-y-auto max-h-[220px] flex-1 pr-1">
                      {usage.points.length === 0 ? (
                        <p className="text-sm text-muted-foreground font-body text-center py-10">Chưa có heartbeat trong khoảng ngày này.</p>
                      ) : (
                        usage.points.slice(-6).map((point) => {
                          const max = Math.max(...usage.points.map((p) => p.activeSeconds), 1);
                          const percentage = Math.max(4, Math.round((point.activeSeconds / max) * 100));
                          return (
                            <div key={point.date} className="flex flex-col gap-1 text-sm">
                              <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                                <span className="font-body">{point.date}</span>
                                <span className="font-body text-foreground">{formatDuration(point.activeSeconds)}</span>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-muted w-full">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${percentage}%`, background: "var(--gradient-primary)" }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Payments Table (Transactions representation) */}
                <div className="card-pastel p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 className="font-display font-bold text-base text-foreground">Lịch sử giao dịch gần đây</h3>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        placeholder="Tìm kiếm giao dịch..."
                        className="w-full pl-9 pr-3 py-2 text-xs font-body rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="min-w-[700px] w-full text-left text-xs">
                      <thead className="bg-muted/60 text-[10px] uppercase text-muted-foreground font-bold">
                        <tr>
                          <th className="px-4 py-3">Mã giao dịch</th>
                          <th className="px-4 py-3">Người dùng</th>
                          <th className="px-4 py-3">Gói cước</th>
                          <th className="px-4 py-3 text-right">Số tiền</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Ngày tạo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.payments.slice(0, 5).map((payment) => (
                          <tr key={payment.transactionId} className="border-t border-border hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-foreground">#{payment.transactionId}</td>
                            <td className="px-4 py-3 text-muted-foreground">{payment.userEmail}</td>
                            <td className="px-4 py-3 font-semibold">{payment.planId}</td>
                            <td className="px-4 py-3 text-right font-bold text-primary">{formatMoney(payment.amount)}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge(payment.status)}`}>
                                {userStatusLabel(payment.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                          </tr>
                        ))}
                        {payments.payments.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-muted-foreground font-body">Chưa có giao dịch.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Sidebar Stats & Activity Logs */}
              <div className="space-y-4">
                
                {/* 4-Grid vertical stats cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-pastel p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-base font-display font-bold text-foreground">{overview.totalUsers}</span>
                      <span className="text-[10px] text-muted-foreground font-body">Tổng học viên</span>
                    </div>
                  </div>
                  
                  <div className="card-pastel p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-base font-display font-bold text-foreground">{overview.aiAttempts}</span>
                      <span className="text-[10px] text-muted-foreground font-body">Quét AI</span>
                    </div>
                  </div>
                  
                  <div className="card-pastel p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <BadgeDollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-base font-display font-bold text-foreground">{overview.successfulPayments}</span>
                      <span className="text-[10px] text-muted-foreground font-body">Thanh toán</span>
                    </div>
                  </div>
                  
                  <div className="card-pastel p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <Clock3 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-base font-display font-bold text-foreground">{formatDuration(overview.averageActiveSeconds)}</span>
                      <span className="text-[10px] text-muted-foreground font-body">Hoạt động TB</span>
                    </div>
                  </div>
                </div>

                {/* Calendar strip card */}
                <div className="card-pastel p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-xs font-display font-bold text-foreground">
                      Tháng {new Date().getMonth() + 1} / {new Date().getFullYear()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-1.5">
                    {calendarWeek.map((day, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 flex flex-col items-center py-2 rounded-xl text-center font-body transition-all ${
                          day.isToday
                            ? "bg-primary text-primary-foreground shadow-md font-bold scale-105"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider opacity-80">{day.name.slice(0, 3)}</span>
                        <span className="text-sm font-display font-extrabold mt-1">{day.dateNum}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit logs (Activity Log) */}
                <div className="card-pastel p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display font-bold text-base text-foreground">Nhật ký hoạt động</h3>
                    <button 
                      onClick={() => setActiveTab("audit")} 
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="space-y-4 flex-1">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                          {log.actorEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{log.actorEmail}</p>
                          <p className="text-[11px] text-muted-foreground font-body mt-0.5 leading-snug">
                            {log.action} <span className="font-semibold">{log.targetType}</span>
                          </p>
                          {log.reason && (
                            <p className="text-[10px] text-muted-foreground italic font-body mt-0.5 truncate">"{log.reason}"</p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-body">
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6">Chưa có nhật ký hoạt động.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === "users" && (
            <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
              <div className="space-y-3">
                <div className="grid gap-2 md:grid-cols-[1fr_160px_160px_auto]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={userSearch}
                      onChange={(event) => setUserSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void refreshUsers();
                      }}
                      placeholder="Tìm email hoặc tên"
                      className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm"
                    />
                  </div>
                  <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setUsersPage(0); }} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="">Tất cả vai trò</option>
                    <option value="USER">Học viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="SUPER_ADMIN">Quản trị cấp cao</option>
                    <option value="CONTENT_REVIEWER">Duyệt nội dung</option>
                  </select>
                  <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setUsersPage(0); }} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="DISABLED">Đã vô hiệu hóa</option>
                  </select>
                  <button onClick={refreshUsers} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-3 text-sm font-bold text-background">
                    <Search className="h-4 w-4" />
                    Lọc
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="min-w-[840px] w-full text-left text-sm">
                      <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Người dùng</th>
                          <th className="px-4 py-3">Vai trò</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Gói</th>
                          <th className="px-4 py-3">Lần cuối</th>
                          <th className="px-4 py-3 text-right">XP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.users.map((user) => (
                          <tr key={user.id} className="border-t border-border hover:bg-muted/40">
                            <td className="px-4 py-3">
                              <button onClick={() => selectUser(user.id)} className="min-w-0 text-left">
                                <span className="block font-bold text-foreground">{user.displayName}</span>
                                <span className="block text-xs text-muted-foreground">{user.email}</span>
                              </button>
                            </td>
                            <td className="px-4 py-3 font-semibold">{roleLabel(user.role)}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusBadge(user.status)}`}>{userStatusLabel(user.status)}</span>
                            </td>
                            <td className="px-4 py-3">{accountTypeLabel(user.accountType)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(user.lastSeenAt)}</td>
                            <td className="px-4 py-3 text-right font-semibold">{user.totalXp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {users.totalPages > 1 && (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm">
                      <span className="text-muted-foreground">
                        Hiển thị {users.users.length} học viên (Trang {users.page + 1} / {users.totalPages})
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={users.page <= 0}
                          onClick={() => setUsersPage(users.page - 1)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 font-bold text-foreground hover:bg-muted disabled:opacity-50"
                        >
                          Trước
                        </button>
                        <button
                          type="button"
                          disabled={users.page >= users.totalPages - 1}
                          onClick={() => setUsersPage(users.page + 1)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 font-bold text-foreground hover:bg-muted disabled:opacity-50"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                {selectedUser ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Chi tiết người dùng</p>
                      <h2 className="mt-1 text-lg font-display font-bold text-foreground">{selectedUser.user.displayName}</h2>
                      <p className="text-sm text-muted-foreground">{selectedUser.user.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-muted/60 px-3 py-2">
                        <p className="text-xs font-semibold text-muted-foreground">Thời lượng</p>
                        <p className="mt-1 text-sm font-bold text-foreground">{formatDuration(selectedUser.activity.activeSeconds)}</p>
                      </div>
                      <div className="rounded-md bg-muted/60 px-3 py-2">
                        <p className="text-xs font-semibold text-muted-foreground">AI đạt</p>
                        <p className="mt-1 text-sm font-bold text-foreground">{selectedUser.activity.aiPassedAttempts}/{selectedUser.activity.aiAttempts}</p>
                      </div>
                    </div>

                    <label className="block text-sm font-semibold text-foreground">
                      Tên hiển thị
                      <input
                        value={editForm.displayName}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, displayName: event.target.value }))}
                        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-foreground">
                      Loại tài khoản
                      <select
                        value={editForm.accountType}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, accountType: event.target.value as AccountType }))}
                        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      >
                        <option value="BASIC">Cơ bản</option>
                        <option value="PREMIUM">Cao cấp</option>
                      </select>
                    </label>
                    {canEditRoles && (
                      <label className="block text-sm font-semibold text-foreground">
                        Vai trò
                        <select
                          value={editForm.role}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                          className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                        >
                          <option value="USER">Học viên</option>
                          <option value="ADMIN">Quản trị viên</option>
                          <option value="SUPER_ADMIN">Quản trị cấp cao</option>
                          <option value="CONTENT_REVIEWER">Duyệt nội dung</option>
                        </select>
                      </label>
                    )}
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">
                      Đang hoạt động
                      <input
                        type="checkbox"
                        checked={editForm.active}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, active: event.target.checked }))}
                        className="h-4 w-4 accent-primary"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-foreground">
                      Lý do ghi nhật ký
                      <textarea
                        value={editForm.reason}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, reason: event.target.value }))}
                        className="mt-1 min-h-[84px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={saveUser}
                        disabled={saving}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-foreground px-3 text-sm font-bold text-background disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" />
                        Lưu
                      </button>
                      <button
                        onClick={deactivateUser}
                        disabled={saving || selectedUser.user.status === "DISABLED"}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-3 text-sm font-bold text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Vô hiệu hóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center text-center text-sm text-muted-foreground">
                    Chọn một người dùng để xem chi tiết.
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "payments" && (
            <section className="space-y-3">
              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="min-w-[860px] w-full text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Mã giao dịch</th>
                      <th className="px-4 py-3">Người dùng</th>
                      <th className="px-4 py-3">Gói</th>
                      <th className="px-4 py-3">Nhà cung cấp</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Số tiền</th>
                      <th className="px-4 py-3">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.payments.map((payment) => (
                      <tr key={payment.transactionId} className="border-t border-border">
                        <td className="px-4 py-3 font-semibold">{payment.transactionId}</td>
                        <td className="px-4 py-3 text-muted-foreground">{payment.userEmail}</td>
                        <td className="px-4 py-3">{payment.planId}</td>
                        <td className="px-4 py-3">{payment.provider}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusBadge(payment.status)}`}>{userStatusLabel(payment.status)}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatMoney(payment.amount)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {payments.totalPages > 1 && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm">
                  <span className="text-muted-foreground">
                    Hiển thị {payments.payments.length} giao dịch (Trang {payments.page + 1} / {payments.totalPages})
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={payments.page <= 0}
                      onClick={() => setPaymentsPage(payments.page - 1)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 font-bold text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      disabled={payments.page >= payments.totalPages - 1}
                      onClick={() => setPaymentsPage(payments.page + 1)}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 font-bold text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "audit" && (
            <section className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Người thao tác</th>
                    <th className="px-4 py-3">Hành động</th>
                    <th className="px-4 py-3">Đối tượng</th>
                    <th className="px-4 py-3">Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="border-t border-border">
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(log.createdAt)}</td>
                      <td className="px-4 py-3">{log.actorEmail}</td>
                      <td className="px-4 py-3 font-semibold">{log.action}</td>
                      <td className="px-4 py-3">{log.targetType}: {log.targetId}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </div>
  );
}
