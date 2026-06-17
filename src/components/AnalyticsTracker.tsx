import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/services/analytics";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const timer = window.setTimeout(() => trackPageView(pagePath), 0);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
