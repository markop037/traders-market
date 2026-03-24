"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
};

/**
 * Renders children with resolved auth; use for CTAs that differ by login state.
 * Does not gate subscription — use SubscriptionGate for paid-only content.
 */
export function AuthAwareSlot({
  children,
}: {
  children: (state: AuthState) => ReactNode;
}) {
  const { user, loading } = useAuth();
  return <>{children({ user, loading })}</>;
}
