import {
  INVALID_GROUP_ID_SENTINEL,
  MAILERLITE_API_BASE,
  MAILERLITE_SUBSCRIBERS_URL,
} from "./config";
import type { FirestoreUser } from "./types";
import { buildMailerLiteFields, effectiveEmailConsent } from "./upsertSubscriber";

export interface MailerLiteSubscriberRow {
  id: string;
  email: string;
  status: string;
}

function readHeaders(apiToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiToken}`,
    Accept: "application/json",
  };
}

function writeHeaders(apiToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function bodySnippet(text: string): string {
  return text.length > 500 ? `${text.slice(0, 500)}…` : text;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSubscriberByEmail(
  apiToken: string,
  email: string
): Promise<MailerLiteSubscriberRow | null> {
  const url = `${MAILERLITE_API_BASE}/subscribers/${encodeURIComponent(email)}`;
  let lastStatus = 0;
  let lastText = "";

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { method: "GET", headers: readHeaders(apiToken) });
    if (res.status === 404) return null;

    const text = await res.text();
    lastStatus = res.status;
    lastText = text;

    if (res.ok) {
      const json = JSON.parse(text) as {
        data?: { id?: string; email?: string; status?: string };
      };
      const d = json.data;
      if (!d?.id) return null;
      return {
        id: String(d.id),
        email: String(d.email ?? email),
        status: String(d.status ?? ""),
      };
    }

    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * (attempt + 1));
      continue;
    }

    throw new Error(`MailerLite GET subscriber failed: ${res.status} ${text.slice(0, 400)}`);
  }

  throw new Error(
    `MailerLite GET subscriber failed after retries: ${lastStatus} ${lastText.slice(0, 400)}`
  );
}

export interface SyncResult {
  ok: boolean;
  status: number;
  bodySnippet: string;
  action?: string;
}

/**
 * Opted-in → active in All Users. Opted-out → MailerLite `unsubscribed` (All Subscribers → Unsubscribed filter)
 * with `groups: []` so they are removed from marketing groups. No separate “Unsubscribed Users” group.
 */
export async function syncFirestoreUserToMailerLite(
  user: FirestoreUser,
  options: {
    apiToken: string;
    allUsersGroupId: string;
  }
): Promise<SyncResult> {
  const { apiToken, allUsersGroupId } = options;
  if (!allUsersGroupId?.trim() || allUsersGroupId === INVALID_GROUP_ID_SENTINEL) {
    return {
      ok: false,
      status: 0,
      bodySnippet: "Invalid MailerLite group id (placeholder or empty)",
    };
  }

  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (!email || !email.includes("@")) {
    return { ok: false, status: 0, bodySnippet: "No usable email" };
  }

  const fields = buildMailerLiteFields(user);
  const consented = effectiveEmailConsent(user);

  const existing = await fetchSubscriberByEmail(apiToken, email);
  await sleep(200);

  if (consented) {
    if (!existing) {
      const res = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
        method: "POST",
        headers: writeHeaders(apiToken),
        body: JSON.stringify({
          email,
          fields,
          groups: [allUsersGroupId],
          status: "active",
        }),
      });
      const text = await res.text();
      return {
        ok: res.ok,
        status: res.status,
        bodySnippet: bodySnippet(text),
        action: "POST_create_active",
      };
    }

    if (existing.status !== "active") {
      const res = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
        method: "POST",
        headers: writeHeaders(apiToken),
        body: JSON.stringify({
          email,
          fields,
          groups: [allUsersGroupId],
          status: "active",
          resubscribe: true,
        }),
      });
      const text = await res.text();
      return {
        ok: res.ok,
        status: res.status,
        bodySnippet: bodySnippet(text),
        action: "POST_resubscribe",
      };
    }

    const res = await fetch(`${MAILERLITE_API_BASE}/subscribers/${existing.id}`, {
      method: "PUT",
      headers: writeHeaders(apiToken),
      body: JSON.stringify({
        fields,
        groups: [allUsersGroupId],
        status: "active",
      }),
    });
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      bodySnippet: bodySnippet(text),
      action: "PUT_active",
    };
  }

  if (!existing) {
    const res = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
      method: "POST",
      headers: writeHeaders(apiToken),
      body: JSON.stringify({
        email,
        fields,
        status: "unsubscribed",
      }),
    });
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      bodySnippet: bodySnippet(text),
      action: "POST_create_unsubscribed",
    };
  }

  let res = await fetch(`${MAILERLITE_API_BASE}/subscribers/${existing.id}`, {
    method: "PUT",
    headers: writeHeaders(apiToken),
    body: JSON.stringify({
      fields,
      status: "unsubscribed",
      groups: [],
    }),
  });
  let text = await res.text();

  if (!res.ok && res.status === 422) {
    res = await fetch(`${MAILERLITE_API_BASE}/subscribers/${existing.id}`, {
      method: "PUT",
      headers: writeHeaders(apiToken),
      body: JSON.stringify({
        fields,
        status: "unsubscribed",
      }),
    });
    text = await res.text();
  }

  return {
    ok: res.ok,
    status: res.status,
    bodySnippet: bodySnippet(text),
    action: "PUT_unsubscribed",
  };
}
