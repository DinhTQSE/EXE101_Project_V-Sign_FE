const LOCAL_API_HOST_PATTERN = /(^|\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/i;

export function getApiBaseUrl() {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").trim();

  if (import.meta.env.PROD && LOCAL_API_HOST_PATTERN.test(apiBaseUrl)) {
    throw new Error("Production VITE_API_BASE_URL must not point to localhost.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}
