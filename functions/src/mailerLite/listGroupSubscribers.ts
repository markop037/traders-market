import { MAILERLITE_API_BASE } from "./config";

export interface GroupSubscriberRow {
  id: string;
  email: string;
}

function authHeaders(apiToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiToken}`,
    Accept: "application/json",
  };
}

/**
 * Paginates **active** subscribers in a MailerLite group.
 * @see https://developers.mailerlite.com/docs/groups.html
 */
export async function fetchAllActiveSubscribersInGroup(
  apiToken: string,
  groupId: string
): Promise<GroupSubscriberRow[]> {
  const rows: GroupSubscriberRow[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`${MAILERLITE_API_BASE}/groups/${groupId}/subscribers`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("filter[status]", "active");
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: authHeaders(apiToken),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `MailerLite list group subscribers failed: ${res.status} ${text.slice(0, 400)}`
      );
    }

    const json = JSON.parse(text) as {
      data?: { id?: string; email?: string }[];
      meta?: { next_cursor?: string | null };
    };

    for (const row of json.data ?? []) {
      if (row?.id != null && row.email) {
        rows.push({ id: String(row.id), email: String(row.email) });
      }
    }

    const next = json.meta?.next_cursor;
    cursor = next && String(next).length > 0 ? String(next) : undefined;
  } while (cursor);

  return rows;
}
