/**
 * Set emailConsent = true on all Firestore `users` docs that are not already true.
 *
 * From `functions/`:
 *   npm run users:set-email-consent-true -- --dry-run
 *   npm run users:set-email-consent-true
 *
 * Requires Firestore credentials (same as other maintenance scripts).
 */

import * as fs from "fs";
import * as path from "path";
import "./loadEnvForImport";
import * as admin from "firebase-admin";
import { setAllUsersEmailConsentTrue } from "../firestoreSync/setAllUsersEmailConsentTrue";

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
    const summary = await setAllUsersEmailConsentTrue(db, {
      dryRun,
      log: (msg, meta) => console.log(msg, meta ?? ""),
    });
    console.log(JSON.stringify(summary, null, 2));
  } catch (e) {
    console.error(
      "Failed. Set TRADERS_MARKET_FIREBASE_SERVICE_ACCOUNT_KEY or use Application Default Credentials."
    );
    console.error(e);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
