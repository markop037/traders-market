import type { Timestamp } from "firebase-admin/firestore";
import {
  FIELD_KEYS,
  INVALID_GROUP_ID_SENTINEL,
  MAILERLITE_SUBSCRIBERS_URL,
} from "./config";
import type { FirestoreUser } from "./types";

export interface MailerLiteSubscriberPayload {
  email: string;
  groups: string[];
  fields: Record<string, string>;
}

function timestampToIso(value: Timestamp | undefined): string | undefined {
  if (!value || typeof value.toDate !== "function") return undefined;
  try {
    return value.toDate().toISOString();
  } catch {
    return undefined;
  }
}

function paymentDateToString(
  value: FirestoreUser["paymentDate"]
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof (value as Timestamp).toDate === "function") {
    try {
      return (value as Timestamp).toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function optionalTrimString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = typeof value === "string" ? value.trim() : String(value).trim();
  return s || undefined;
}

function paymentAmountToString(
  value: FirestoreUser["paymentAmount"]
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(2);
  }
  return optionalTrimString(value);
}

/** Marketing opt-in as stored in MailerLite `email_consent` (missing Firestore field = false). */
export function effectiveEmailConsent(user: FirestoreUser): boolean {
  return user.emailConsent === true || user.emailConsent === "true";
}

/** Custom fields payload for MailerLite; always includes `email_consent`. */
export function buildMailerLiteFields(user: FirestoreUser): Record<string, string> {
  const hasPaid = user.hasPaid === true;
  const createdIso = timestampToIso(user.createdAt);

  const fields: Record<string, string> = {
    [FIELD_KEYS.hasPaid]: hasPaid ? "true" : "false",
    [FIELD_KEYS.emailConsent]: effectiveEmailConsent(user) ? "true" : "false",
  };
  if (createdIso) fields[FIELD_KEYS.createdAt] = createdIso;

  const payDate = paymentDateToString(user.paymentDate);
  if (payDate) fields[FIELD_KEYS.paymentDate] = payDate;

  const payAmt = paymentAmountToString(user.paymentAmount);
  if (payAmt) fields[FIELD_KEYS.paymentAmount] = payAmt;

  const payCur = optionalTrimString(user.paymentCurrency);
  if (payCur) fields[FIELD_KEYS.paymentCurrency] = payCur;

  const sid = optionalTrimString(user.stripeSessionId);
  if (sid) fields[FIELD_KEYS.stripeSessionId] = sid;

  fields[FIELD_KEYS.firstName] = optionalTrimString(user.firstName) ?? "";
  fields[FIELD_KEYS.lastName] = optionalTrimString(user.lastName) ?? "";

  const loc = optionalTrimString(user.location);
  if (loc) fields[FIELD_KEYS.location] = loc;

  const dob = optionalTrimString(user.dateOfBirth);
  if (dob) fields[FIELD_KEYS.dateOfBirth] = dob;

  return fields;
}

export function buildSubscriberPayload(
  user: FirestoreUser,
  allUsersGroupId: string
): MailerLiteSubscriberPayload | null {
  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (!email || !email.includes("@")) return null;

  return {
    email,
    groups: [allUsersGroupId],
    fields: buildMailerLiteFields(user),
  };
}

export interface UpsertResult {
  ok: boolean;
  status: number;
  bodySnippet: string;
}

export async function upsertMailerLiteSubscriber(
  apiToken: string,
  payload: MailerLiteSubscriberPayload
): Promise<UpsertResult> {
  if (
    !payload.groups.length ||
    !payload.groups[0].trim() ||
    payload.groups[0] === INVALID_GROUP_ID_SENTINEL
  ) {
    return {
      ok: false,
      status: 0,
      bodySnippet: "Invalid MailerLite group id (still placeholder or empty)",
    };
  }

  const res = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      groups: payload.groups,
      fields: payload.fields,
    }),
  });

  const text = await res.text();
  const snippet = text.length > 500 ? `${text.slice(0, 500)}…` : text;

  return {
    ok: res.ok,
    status: res.status,
    bodySnippet: snippet,
  };
}
