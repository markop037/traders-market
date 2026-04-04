import type { Firestore } from "firebase-admin/firestore";
import { shouldSyncHistoricalImport } from "./shouldSync";
import { syncFirestoreUserToMailerLite } from "./syncSubscriberState";
import type { FirestoreUser } from "./types";

/** MailerLite rate limits; keep imports safe for ~30+ users (GET + PUT per user). */
const THROTTLE_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface HistoricalImportSummary {
  totalDocs: number;
  success: number;
  skipped: number;
  errors: number;
}

export async function runHistoricalMailerLiteImport(
  db: Firestore,
  apiToken: string,
  allUsersGroupId: string,
  log: { info: (msg: string, meta?: object) => void; error: (msg: string, meta?: object) => void }
): Promise<HistoricalImportSummary> {
  const snap = await db.collection("users").get();
  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const docSnap of snap.docs) {
    const raw = docSnap.data() as FirestoreUser;
    if (!shouldSyncHistoricalImport(raw)) {
      skipped++;
      continue;
    }

    const email = typeof raw.email === "string" ? raw.email.trim() : "";
    if (!email || !email.includes("@")) {
      skipped++;
      continue;
    }

    try {
      const result = await syncFirestoreUserToMailerLite(raw, {
        apiToken,
        allUsersGroupId,
      });
      if (result.ok) {
        success++;
        log.info(`Historical import OK: ${email}`, { action: result.action });
      } else {
        errors++;
        log.error(`Historical import FAIL: ${email}`, {
          status: result.status,
          bodySnippet: result.bodySnippet,
        });
      }
    } catch (e) {
      errors++;
      log.error(`Historical import FAIL: ${email}`, {
        err: e instanceof Error ? e.message : String(e),
      });
    }

    await sleep(THROTTLE_MS);
  }

  return { totalDocs: snap.size, success, skipped, errors };
}
