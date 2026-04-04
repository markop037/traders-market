import type { Firestore } from "firebase-admin/firestore";
import { deleteMailerLiteSubscriberById } from "./deleteSubscriber";
import { fetchAllActiveSubscribersInGroup } from "./listGroupSubscribers";
import { runHistoricalMailerLiteImport } from "./runHistoricalImport";
import { hasUsableFirestoreEmail } from "./shouldSync";
import type { FirestoreUser } from "./types";

const THROTTLE_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface ReconcileSummary {
  dryRun: boolean;
  firestoreEmailsCount: number;
  mailerLiteInGroupCount: number;
  deleted: number;
  deleteErrors: number;
  import: {
    totalDocs: number;
    success: number;
    skipped: number;
    errors: number;
  } | null;
}

/**
 * 1) Deletes MailerLite subscribers in **All Users** (`allUsersGroupId`) who are **active** but whose
 *    email is not present on any Firestore `users` doc (normalized).
 * 2) Re-runs historical import so every Firestore user with email is synced (active + All Users vs `unsubscribed` by `emailConsent`).
 */
export async function reconcileMailerLiteWithFirestore(
  db: Firestore,
  apiToken: string,
  allUsersGroupId: string,
  options: {
    dryRun: boolean;
    log: { info: (msg: string, meta?: object) => void; error: (msg: string, meta?: object) => void };
  }
): Promise<ReconcileSummary> {
  const snap = await db.collection("users").get();
  const firestoreEmails = new Set<string>();

  for (const doc of snap.docs) {
    const u = doc.data() as FirestoreUser;
    if (!hasUsableFirestoreEmail(u)) continue;
    const raw = typeof u.email === "string" ? u.email.trim() : "";
    if (!raw || !raw.includes("@")) continue;
    firestoreEmails.add(normalizeEmail(raw));
  }

  const inGroup = await fetchAllActiveSubscribersInGroup(apiToken, allUsersGroupId);

  let deleted = 0;
  let deleteErrors = 0;

  for (const sub of inGroup) {
    if (firestoreEmails.has(normalizeEmail(sub.email))) {
      continue;
    }

    if (options.dryRun) {
      options.log.info("Reconcile: would delete MailerLite subscriber", {
        id: sub.id,
        email: sub.email,
      });
      deleted++;
      continue;
    }

    try {
      const result = await deleteMailerLiteSubscriberById(apiToken, sub.id);
      if (result.ok) {
        deleted++;
        options.log.info("Reconcile: deleted MailerLite subscriber", {
          email: sub.email,
        });
      } else {
        deleteErrors++;
        options.log.error("Reconcile: delete failed", {
          email: sub.email,
          status: result.status,
          bodySnippet: result.bodySnippet,
        });
      }
    } catch (e) {
      deleteErrors++;
      options.log.error("Reconcile: delete threw", {
        email: sub.email,
        err: e instanceof Error ? e.message : String(e),
      });
    }

    await sleep(THROTTLE_MS);
  }

  let importSummary: ReconcileSummary["import"] = null;
  if (!options.dryRun) {
    const hist = await runHistoricalMailerLiteImport(db, apiToken, allUsersGroupId, {
      info: options.log.info,
      error: options.log.error,
    });
    importSummary = {
      totalDocs: hist.totalDocs,
      success: hist.success,
      skipped: hist.skipped,
      errors: hist.errors,
    };
  }

  return {
    dryRun: options.dryRun,
    firestoreEmailsCount: firestoreEmails.size,
    mailerLiteInGroupCount: inGroup.length,
    deleted,
    deleteErrors,
    import: importSummary,
  };
}
