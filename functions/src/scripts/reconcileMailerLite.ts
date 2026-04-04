/**
 * Sync MailerLite with Firestore: delete orphan group subscribers, re-upsert opted-in users.
 *
 *   npm run reconcile:mailerlite -- --dry-run
 *   npm run reconcile:mailerlite
 *
 * Requires MAILERLITE_API_TOKEN and Firestore credentials (same as import script).
 */

import "./loadEnvForImport";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_ALL_USERS_GROUP_ID, INVALID_GROUP_ID_SENTINEL } from "../mailerLite/config";
import { reconcileMailerLiteWithFirestore } from "../mailerLite/reconcileWithFirestore";

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
  const dryRun = process.argv.includes("--dry-run");
  const apiToken = process.env.MAILERLITE_API_TOKEN?.trim();
  const allUsersGroupId =
    process.env.MAILERLITE_ALL_USERS_GROUP_ID?.trim() || DEFAULT_ALL_USERS_GROUP_ID;

  if (!apiToken) {
    console.error("Missing MAILERLITE_API_TOKEN");
    process.exit(1);
  }
  if (!allUsersGroupId || allUsersGroupId === INVALID_GROUP_ID_SENTINEL) {
    console.error("Invalid MAILERLITE_ALL_USERS_GROUP_ID");
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

  const db = admin.firestore();

  try {
    const summary = await reconcileMailerLiteWithFirestore(db, apiToken, allUsersGroupId, {
      dryRun,
      log: {
        info: (msg, meta) => console.log(msg, meta ?? ""),
        error: (msg, meta) => console.error(msg, meta ?? ""),
      },
    });
    console.log(JSON.stringify(summary, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
