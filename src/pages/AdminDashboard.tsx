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
} from "lucide-react";
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
  { id: "audit", label: "Audit", icon: FileText },
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
  const [editForm, setEditForm] = useState({ displayName: "", accountType: "BASIC" as AccountType, role: "USER" as UserRole, active: true, reason: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canEditRoles = profile.role === "SUPER_ADMIN";

  const dateInput = useMemo(() => ({ fromDate, toDate }), [fromDate, toDate]);

  const loadDashboard = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const [nextOverview, nextUsage, nextUsers, nextPayments, nextAudit] = await Promise.all([
        adminApi.getMetricsOverview(accessToken, dateInput),
        adminApi.getUsageMetrics(accessToken, { ...dateInput, granularity: "daily" }),
        adminApi.listUsers(accessToken, { search: userSearch, role: roleFilter, status: statusFilter, page: 0, size: 20 }),
        adminApi.listPayments(accessToken, 0, 10),
        adminApi.listAuditLogs(accessToken),
      ]);
      setOverview(nextOverview);
      setUsage(nextUsage);
      setUsers(nextUsers);
      setPayments(nextPayments);
      setAuditLogs(nextAudit);
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, dateInput, roleFilter, statusFilter, userSearch]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

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

  const refreshUsers = async () => {
    if (!accessToken) return;
    const nextUsers = await adminApi.listUsers(accessToken, { search: userSearch, role: roleFilter, status: statusFilter, page: 0, size: 20 });
    setUsers(nextUsers);
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
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi label="Tổng người dùng" value={overview.totalUsers} icon={Users} />
                <Kpi label="Active trong kỳ" value={overview.activeUsersInRange} icon={Activity} />
                <Kpi label="Premium" value={overview.premiumUsers} icon={ShieldCheck} />
                <Kpi label="Doanh thu" value={formatMoney(overview.totalRevenueVnd)} icon={BadgeDollarSign} />
                <Kpi label="Hoàn thành bài" value={overview.lessonCompletions} icon={FileText} />
                <Kpi label="Quiz attempts" value={overview.quizAttempts} icon={UserCog} />
                <Kpi label="AI attempts" value={overview.aiAttempts} icon={Activity} />
                <Kpi label="Thời gian TB" value={formatDuration(overview.averageActiveSeconds)} icon={Clock3} />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-base font-display font-bold text-foreground">Usage theo ngày</h2>
                    <span className="text-xs text-muted-foreground">{usage.points.length} ngày</span>
                  </div>
                  <div className="space-y-3">
                    {usage.points.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có heartbeat trong khoảng ngày này.</p>
                    ) : (
                      usage.points.slice(-10).map((point) => {
                        const max = Math.max(...usage.points.map((p) => p.activeSeconds), 1);
                        return (
                          <div key={point.date} className="grid grid-cols-[92px_1fr_72px] items-center gap-3 text-sm">
                            <span className="text-muted-foreground">{point.date.slice(5)}</span>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${Math.max(4, (point.activeSeconds / max) * 100)}%` }}
                              />
                            </div>
                            <span className="text-right font-semibold text-foreground">{formatDuration(point.activeSeconds)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h2 className="mb-4 text-base font-display font-bold text-foreground">Top active users</h2>
                  <div className="space-y-3">
                    {overview.topActiveUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
                    ) : overview.topActiveUsers.map((user) => (
                      <div key={user.email} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">{user.displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{formatDuration(user.activeSeconds)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
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
                  <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="">Tất cả role</option>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="CONTENT_REVIEWER">CONTENT_REVIEWER</option>
                  </select>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="">Tất cả status</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                  <button onClick={refreshUsers} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-3 text-sm font-bold text-background">
                    <Search className="h-4 w-4" />
                    Lọc
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="min-w-[840px] w-full text-left text-sm">
                    <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Người dùng</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Gói</th>
                        <th className="px-4 py-3">Last seen</th>
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
                          <td className="px-4 py-3 font-semibold">{user.role}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusBadge(user.status)}`}>{user.status}</span>
                          </td>
                          <td className="px-4 py-3">{user.accountType}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(user.lastSeenAt)}</td>
                          <td className="px-4 py-3 text-right font-semibold">{user.totalXp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                {selectedUser ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Chi tiết user</p>
                      <h2 className="mt-1 text-lg font-display font-bold text-foreground">{selectedUser.user.displayName}</h2>
                      <p className="text-sm text-muted-foreground">{selectedUser.user.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-muted/60 px-3 py-2">
                        <p className="text-xs font-semibold text-muted-foreground">Active</p>
                        <p className="mt-1 text-sm font-bold text-foreground">{formatDuration(selectedUser.activity.activeSeconds)}</p>
                      </div>
                      <div className="rounded-md bg-muted/60 px-3 py-2">
                        <p className="text-xs font-semibold text-muted-foreground">AI passed</p>
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
                      Account type
                      <select
                        value={editForm.accountType}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, accountType: event.target.value as AccountType }))}
                        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      >
                        <option value="BASIC">BASIC</option>
                        <option value="PREMIUM">PREMIUM</option>
                      </select>
                    </label>
                    {canEditRoles && (
                      <label className="block text-sm font-semibold text-foreground">
                        Role
                        <select
                          value={editForm.role}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                          className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          <option value="CONTENT_REVIEWER">CONTENT_REVIEWER</option>
                        </select>
                      </label>
                    )}
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">
                      Active
                      <input
                        type="checkbox"
                        checked={editForm.active}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, active: event.target.checked }))}
                        className="h-4 w-4 accent-primary"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-foreground">
                      Lý do audit
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
                    Chọn một user để xem chi tiết.
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "payments" && (
            <section className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Created</th>
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
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusBadge(payment.status)}`}>{payment.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatMoney(payment.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === "audit" && (
            <section className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Reason</th>
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
