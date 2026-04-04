/**
 * One-time bulk import: reads all `users` docs, gates with shouldSyncHistoricalImport (valid email), upserts to MailerLite.
 *
 * Run from `functions/`: `npm run import:users`
 * Loads `.env.local` (repo root). Set `MAILERLITE_API_TOKEN` and optionally
 * `TRADERS_MARKET_FIREBASE_SERVICE_ACCOUNT_KEY` or `GOOGLE_APPLICATION_CREDENTIALS`.
 *
 * If you have no local Firestore credentials, use the deployed httpRunMailerLiteHistoricalImport function (URL in deploy output).
 */

import * as fs from "fs";
import * as path from "path";
import "./loadEnvForImport";
import * as admin from "firebase-admin";
import { DEFAULT_ALL_USERS_GROUP_ID, INVALID_GROUP_ID_SENTINEL } from "../mailerLite/config";
import { runHistoricalMailerLiteImport } from "../mailerLite/runHistoricalImport";

function readDefaultProjectFromFirebaserc(): string | undefined {
  try {
    const rcPath = path.resolve(__dirname, "../../../.firebaserc");
    const parsed = JSON.parse(fs.readFileSync(rcPath, "utf8")) as {
      projects?: { default?: string };
    };
    const id = parsed.projects?.default;
    return typeof id === "string" && id.trim() ? id.trim() : undefined;
  } catch {
    return undefined;
  }
}

function resolveProjectId(): string | undefined {
  const fromEnv =
    process.env.GCLOUD_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.FIREBASE_PROJECT_ID?.trim();
  if (fromEnv) return fromEnv;
  return readDefaultProjectFromFirebaserc();
}

async function main(): Promise<void> {
  const apiToken = process.env.MAILERLITE_API_TOKEN?.trim();
  const allUsersGroupId =
    process.env.MAILERLITE_ALL_USERS_GROUP_ID?.trim() || DEFAULT_ALL_USERS_GROUP_ID;

  if (!apiToken) {
    console.error("Missing MAILERLITE_API_TOKEN");
    process.exit(1);
  }
  if (!allUsersGroupId || allUsersGroupId === INVALID_GROUP_ID_SENTINEL) {
    console.error(
      "Set MAILERLITE_ALL_USERS_GROUP_ID to your numeric MailerLite group id (not the placeholder)."
    );
    process.exit(1);
  }

  const projectId = resolveProjectId();
  const serviceAccountJson =
    process.env.TRADERS_MARKET_FIREBASE_SERVICE_ACCOUNT_KEY?.trim();

  if (!admin.apps.length) {
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson) as {
        project_id?: string;
      };
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: projectId || serviceAccount.project_id,
      });
    } else {
      admin.initializeApp(projectId ? { projectId } : {});
    }
  }

  try {
    const db = admin.firestore();
    const summary = await runHistoricalMailerLiteImport(db, apiToken, allUsersGroupId, {
      info: (msg) => console.log(msg),
      error: (msg, meta) => console.error(msg, meta ?? ""),
    });
    console.log(JSON.stringify(summary, null, 2));
  } catch (e) {
    console.error(
      "Firestore import failed. Add TRADERS_MARKET_FIREBASE_SERVICE_ACCOUNT_KEY to .env.local, " +
        "or set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON path, " +
        "or call the deployed httpRunMailerLiteHistoricalImport endpoint (URL appears in firebase deploy output)."
    );
    console.error(e);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
