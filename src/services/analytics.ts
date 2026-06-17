type GtagFunction = (...args: unknown[]) => void;
type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

const GA_SCRIPT_ID = "vsign-ga4-script";
const GA_PLACEHOLDER_ID = "G-XXXXXXXXXX";
const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/i;

let initialized = false;

function getMeasurementId() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

  if (!measurementId || measurementId === GA_PLACEHOLDER_ID) return "";

  if (!GA_MEASUREMENT_ID_PATTERN.test(measurementId)) {
    if (import.meta.env.DEV) {
      console.warn("Invalid VITE_GA_MEASUREMENT_ID. Expected a GA4 ID such as G-XXXXXXXXXX.");
    }
    return "";
  }

  return measurementId.toUpperCase();
}

function isDebugMode() {
  return import.meta.env.VITE_GA_DEBUG === "true";
}

function withDebugMode(params: AnalyticsEventParams) {
  if (!isDebugMode()) return params;
  return { ...params, debug_mode: true };
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
}

function loadAnalyticsScript(measurementId: string) {
  if (document.getElementById(GA_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function isAnalyticsEnabled() {
  return typeof window !== "undefined" && typeof document !== "undefined" && Boolean(getMeasurementId());
}

export function initAnalytics() {
  if (initialized || !isAnalyticsEnabled()) return initialized;

  const measurementId = getMeasurementId();
  ensureGtag();
  loadAnalyticsScript(measurementId);

  window.gtag?.("js", new Date());
  window.gtag?.(
    "config",
    measurementId,
    withDebugMode({
      send_page_view: false,
    }),
  );

  initialized = true;
  return initialized;
}

export function trackPageView(pagePath: string) {
  if (!initAnalytics()) return;

  window.gtag?.(
    "event",
    "page_view",
    withDebugMode({
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
    }),
  );
}

export function trackAnalyticsEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (!eventName || !initAnalytics()) return;

  const cleanedParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== null && value !== undefined));
  window.gtag?.("event", eventName, withDebugMode(cleanedParams));
}
