import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageView } from "@/services/analytics";

export default function AnalyticsTracker() {
  const location = useLocation();
  const didBootstrapInitialPage = useRef(false);

  useEffect(() => {
    if (!didBootstrapInitialPage.current) {
      initAnalytics();
      didBootstrapInitialPage.current = true;
      return undefined;
    }

    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const timer = window.setTimeout(() => trackPageView(pagePath), 0);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
