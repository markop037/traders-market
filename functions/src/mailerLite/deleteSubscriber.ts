import { MAILERLITE_SUBSCRIBERS_URL } from "./config";
import { fetchSubscriberByEmail } from "./syncSubscriberState";

export interface DeleteSubscriberResult {
  ok: boolean;
  status: number;
  bodySnippet: string;
}

export type DeleteSubscriberByEmailAction =
  | "skipped_no_email"
  | "skipped_not_in_mailerlite"
  | "deleted"
  | "delete_failed";

export interface DeleteSubscriberByEmailResult extends DeleteSubscriberResult {
  action: DeleteSubscriberByEmailAction;
}

/**
 * Looks up MailerLite by email, then deletes the subscriber account-wide if found.
 * No-op (success) when email is unusable or subscriber does not exist (idempotent).
 */
export async function deleteMailerLiteSubscriberByEmail(
  apiToken: string,
  email: string
): Promise<DeleteSubscriberByEmailResult> {
  const trimmed = typeof email === "string" ? email.trim() : "";
  if (!trimmed || !trimmed.includes("@")) {
    return {
      ok: true,
      status: 0,
      bodySnippet: "",
      action: "skipped_no_email",
    };
  }

  const existing = await fetchSubscriberByEmail(apiToken, trimmed);
  if (!existing) {
    return {
      ok: true,
      status: 404,
      bodySnippet: "",
      action: "skipped_not_in_mailerlite",
    };
  }

  const result = await deleteMailerLiteSubscriberById(apiToken, existing.id);
  return {
    ...result,
    action: result.ok ? "deleted" : "delete_failed",
  };
}

/**
 * Removes a subscriber from the MailerLite account (by internal id).
 * @see https://developers.mailerlite.com/docs/subscribers.html
 */
export async function deleteMailerLiteSubscriberById(
  apiToken: string,
  subscriberId: string
): Promise<DeleteSubscriberResult> {
  const res = await fetch(`${MAILERLITE_SUBSCRIBERS_URL}/${subscriberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    },
  });

  const text = await res.text();
  const snippet = text.length > 400 ? `${text.slice(0, 400)}…` : text;

  return {
    ok: res.status === 204 || res.status === 200 || res.ok,
    status: res.status,
    bodySnippet: snippet,
  };
}
