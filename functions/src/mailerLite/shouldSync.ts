import type { FirestoreUser } from "./types";

function hasUsableEmail(data: FirestoreUser): boolean {
  const email = typeof data.email === "string" ? data.email.trim() : "";
  if (!email || !email.includes("@")) return false;
  return true;
}

/** Any `users` doc we push to MailerLite (opted-in → active; opted-out → unsubscribed status). */
export function shouldSyncHistoricalImport(data: FirestoreUser): boolean {
  return hasUsableEmail(data);
}

/** Live Firestore triggers: same gate as bulk import. */
export function shouldSyncLiveEmailUser(data: FirestoreUser): boolean {
  return hasUsableEmail(data);
}

/** Emails that exist in Firestore (for reconcile orphan detection); not MailerLite-opt-in only. */
export function hasUsableFirestoreEmail(data: FirestoreUser): boolean {
  return hasUsableEmail(data);
}
