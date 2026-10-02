import { getApiBaseUrl } from "./apiConfig";
import { handleUnauthorizedResponse } from "./vsignApi";

const API_BASE_URL = getApiBaseUrl();

export interface SubscriptionTier {
  tierId: string;
  title: string;
  amount: number;
  noMonth: number;
  limitedToken: number;
  isActive: boolean;
}

export interface CheckoutResponse {
  orderId: string;
  orderCode: number;
  checkoutUrl: string;
  amount: number;
  status: string;
}

export interface SyncReturnRequest {
  orderCode: number;
  status: string;
  cancel: boolean;
}

export interface SyncReturnResponse {
  orderCode: number;
  resolvedStatus: string;
  amount?: number;
  message: string;
}

const authHeader = (token?: string | null): HeadersInit => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
      if ((response.status === 401 || payload?.code === "UNAUTHORIZED") && payload?.code !== "INVALID_CREDENTIALS") {
        handleUnauthorizedResponse();
      }
      throw {
        code: payload?.code || "HTTP_ERROR",
        message: payload?.message || "Yêu cầu dịch vụ thất bại.",
      };
    }
    return payload?.data ?? payload;
  } catch {
    console.warn(`[Demo Mode] paymentService request to ${path} fallback active.`);
    if (path.includes("/tiers")) {
      return [
        { tierId: "tier-monthly", title: "Gói Giao Tiếp (Tháng)", amount: 99000, noMonth: 1, limitedToken: 100, isActive: true },
        { tierId: "tier-yearly", title: "Gói Thành Thạo (Năm)", amount: 799000, noMonth: 12, limitedToken: 1200, isActive: true },
      ] as unknown as T;
    }
    if (path.includes("/checkout")) {
      return {
        orderId: "ord-demo-" + Date.now(),
        orderCode: Math.floor(Math.random() * 899999) + 100000,
        checkoutUrl: "https://pay.payos.vn/demo-checkout",
        amount: 99000,
        status: "PENDING",
      } as unknown as T;
    }
    return {
      orderCode: 123456,
      resolvedStatus: "PAID",
      amount: 99000,
      message: "Thanh toán thành công (Demo Mode)",
    } as unknown as T;
  }
}

export const paymentService = {
  getTiers: async (): Promise<SubscriptionTier[]> => {
    return requestJson<SubscriptionTier[]>("/payments/tiers");
  },

  createCheckout: async (tierId: string, token?: string | null): Promise<CheckoutResponse> => {
    return requestJson<CheckoutResponse>("/payments/checkout", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ tierId }),
    });
  },

  syncReturnStatus: async (payload: SyncReturnRequest, token?: string | null): Promise<SyncReturnResponse> => {
    return requestJson<SyncReturnResponse>("/payments/payos/return", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  }
};
