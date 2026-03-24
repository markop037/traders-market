"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  /** Shown while auth is loading, or while signed-in user doc (subscription) is still loading */
  fallback?: ReactNode;
};

/**
 * Renders children only when the user is signed in and has an active subscription.
 * Does not render protected content while `loading` or while `hasActiveSubscription === undefined`.
 */
export function SubscriptionGate({ children, fallback = null }: Props) {
  const { loading, user, hasActiveSubscription } = useAuth();

  if (loading) return <>{fallback}</>;
  if (!user || hasActiveSubscription === undefined) return <>{fallback}</>;
  if (hasActiveSubscription !== true) return null;

  return <>{children ?? null}</>;
}
