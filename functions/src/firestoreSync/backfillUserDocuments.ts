import type { Auth } from "firebase-admin/auth";
import {
  FieldValue,
  type DocumentData,
  type Firestore,
} from "firebase-admin/firestore";

/**
 * Fields the app reads/writes on `users/{uid}`. Anything else is removed during backfill.
 * Keep in sync with signup, login ensureUserDocument, payment-success, settings.
 */
export const ALLOWED_USER_FIELDS = new Set([
  "email",
  "createdAt",
  "hasPaid",
  "emailConsent",
  "paymentDate",
  "stripeSessionId",
  "paymentAmount",
  "paymentCurrency",
  "firstName",
  "lastName",
  "city",
  "country",
  "dateOfBirth",
]);

const PAYMENT_FIELDS = [
  "paymentDate",
  "stripeSessionId",
  "paymentAmount",
  "paymentCurrency",
] as const;

const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "city",
  "country",
  "dateOfBirth",
] as const;

export interface BackfillSummary {
  dryRun: boolean;
  processed: number;
  updated: number;
  unchanged: number;
  errors: number;
}

function normalizeBooleanHasPaid(raw: unknown): boolean {
  return raw === true;
}

function normalizeEmailConsent(raw: unknown, hadKey: boolean): boolean {
  if (!hadKey) return false;
  if (raw === true) return true;
  if (raw === false) return false;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return false;
}

/**
 * Build Firestore update: defaults, boolean normalization, drop unknown keys,
 * strip payment fields when `hasPaid` is false.
 */
export async function buildUserBackfillPatch(
  uid: string,
  data: DocumentData,
  auth: Auth
): Promise<Record<string, unknown> | null> {
  const patch: Record<string, unknown> = {};

  const hasPaid = normalizeBooleanHasPaid(data.hasPaid);
  if (data.hasPaid !== hasPaid) {
    patch.hasPaid = hasPaid;
  }

  const hadConsentKey = Object.prototype.hasOwnProperty.call(data, "emailConsent");
  const emailConsent = normalizeEmailConsent(data.emailConsent, hadConsentKey);
  if (!hadConsentKey || data.emailConsent !== emailConsent) {
    patch.emailConsent = emailConsent;
  }

  for (const k of PROFILE_FIELDS) {
    const v = data[k];
    if (!(k in data) || v === null || v === undefined) {
      patch[k] = "";
    } else if (typeof v === "string") {
      const t = v.trim();
      if (t !== v) {
        patch[k] = t;
      }
    } else {
      patch[k] = String(v);
    }
  }

  const emailFromDoc = typeof data.email === "string" ? data.email.trim() : "";
  if (!emailFromDoc) {
    try {
      const u = await auth.getUser(uid);
      if (u.email?.trim()) {
        patch.email = u.email.trim();
      }
    } catch {
      /* orphan Firestore doc or auth error */
    }
  }

  if (!data.createdAt) {
    patch.createdAt = FieldValue.serverTimestamp();
  }

  if (!hasPaid) {
    for (const pk of PAYMENT_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(data, pk)) {
        patch[pk] = FieldValue.delete();
      }
    }
  }

  for (const key of Object.keys(data)) {
    if (!ALLOWED_USER_FIELDS.has(key)) {
      patch[key] = FieldValue.delete();
    }
  }

  if (Object.keys(patch).length === 0) {
    return null;
  }

  return patch;
}

export async function backfillAllUserDocuments(
  db: Firestore,
  auth: Auth,
  options: { dryRun: boolean; log: (msg: string, meta?: object) => void }
): Promise<BackfillSummary> {
  const snap = await db.collection("users").get();
  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  for (const doc of snap.docs) {
    const uid = doc.id;
    try {
      const data = doc.data();
      const patch = await buildUserBackfillPatch(uid, data, auth);
      if (!patch) {
        unchanged++;
        continue;
      }
      if (options.dryRun) {
        options.log("Would update user", { uid, keys: Object.keys(patch) });
        updated++;
        continue;
      }
      await doc.ref.update(patch);
      updated++;
    } catch (e) {
      errors++;
      options.log("Backfill error", {
        uid,
        err: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return {
    dryRun: options.dryRun,
    processed: snap.size,
    updated,
    unchanged,
    errors,
  };
}
