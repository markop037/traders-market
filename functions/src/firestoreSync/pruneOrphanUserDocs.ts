import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

const BATCH_MAX = 450;

export interface PruneSummary {
  dryRun: boolean;
  authUserCount: number;
  firestoreUserDocs: number;
  orphanCount: number;
  orphanSamples: { uid: string; email?: string }[];
  deleted: number;
}

/**
 * Deletes `users/{uid}` documents that have no matching Firebase Authentication user.
 */
export async function pruneOrphanUserDocs(
  db: Firestore,
  auth: Auth,
  options: { dryRun: boolean; log: (msg: string, meta?: object) => void }
): Promise<PruneSummary> {
  const authUids = new Set<string>();
  let nextPageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, nextPageToken);
    for (const u of page.users) authUids.add(u.uid);
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  const snap = await db.collection("users").get();
  const orphans: { uid: string; email?: string }[] = [];

  for (const doc of snap.docs) {
    if (!authUids.has(doc.id)) {
      const data = doc.data();
      const email =
        typeof data.email === "string" ? data.email : undefined;
      orphans.push({ uid: doc.id, email });
    }
  }

  const orphanSamples = orphans.slice(0, 25);
  let deleted = 0;

  if (options.dryRun) {
    options.log(`Prune dry-run: would delete ${orphans.length} orphan user doc(s)`, {
      authUserCount: authUids.size,
      firestoreUserDocs: snap.size,
    });
    for (const o of orphanSamples) {
      options.log("Would delete orphan", o);
    }
    if (orphans.length > orphanSamples.length) {
      options.log(`…and ${orphans.length - orphanSamples.length} more`);
    }
    return {
      dryRun: true,
      authUserCount: authUids.size,
      firestoreUserDocs: snap.size,
      orphanCount: orphans.length,
      orphanSamples,
      deleted: 0,
    };
  }

  for (let i = 0; i < orphans.length; i += BATCH_MAX) {
    const chunk = orphans.slice(i, i + BATCH_MAX);
    const batch = db.batch();
    for (const o of chunk) {
      batch.delete(db.collection("users").doc(o.uid));
    }
    await batch.commit();
    deleted += chunk.length;
    options.log(`Deleted batch of ${chunk.length} orphan user doc(s)`);
  }

  return {
    dryRun: false,
    authUserCount: authUids.size,
    firestoreUserDocs: snap.size,
    orphanCount: orphans.length,
    orphanSamples,
    deleted,
  };
}
