import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PremiumGateProps {
  requiredTier: "PLUS" | "PRO";
  fallback: ReactNode;
  children: ReactNode;
}

export default function PremiumGate({ requiredTier, fallback, children }: PremiumGateProps) {
  const { profile, isPremium, subscription } = useAuth();

  const isProUser = (profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") || 
                    (isPremium && subscription?.planType === "YEARLY");

  const isPlusUser = (profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") || 
                     (isPremium && (subscription?.planType === "MONTHLY" || subscription?.planType === "YEARLY"));

  const hasAccess = requiredTier === "PRO" ? isProUser : isPlusUser;

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
