import type { Timestamp } from "firebase-admin/firestore";

/** Firestore `users/{uid}` shape used for MailerLite sync. */
export interface FirestoreUser {
  email?: string;
  createdAt?: Timestamp;
  hasPaid?: boolean;
  /** Absent = pre-checkbox legacy user (still eligible for live sync per product rules). */
  emailConsent?: string | boolean;
  paymentDate?: string | Timestamp;
  paymentAmount?: string | number | null;
  paymentCurrency?: string | null;
  stripeSessionId?: string | null;
  firstName?: string;
  lastName?: string;
  location?: string;
  dateOfBirth?: string;
}
