import type { Firestore } from "firebase-admin/firestore";

const BATCH_MAX = 450;

export interface SetAllEmailConsentSummary {
  dryRun: boolean;
  totalDocs: number;
  updated: number;
  alreadyTrue: number;
}

/**
 * Sets `emailConsent: true` on every `users` document where it is not already strictly `true`
 * (avoids redundant writes and extra MailerLite sync triggers).
 */
export async function setAllUsersEmailConsentTrue(
  db: Firestore,
  options: { dryRun: boolean; log: (msg: string, meta?: object) => void }
): Promise<SetAllEmailConsentSummary> {
  const snap = await db.collection("users").get();
  let updated = 0;
  let alreadyTrue = 0;

  let batch = db.batch();
  let batchOps = 0;

  for (const doc of snap.docs) {
    const v = doc.get("emailConsent");
    if (v === true) {
      alreadyTrue++;
      continue;
    }

    if (options.dryRun) {
      options.log("Would set emailConsent: true", { id: doc.id });
      updated++;
      continue;
    }

    batch.update(doc.ref, { emailConsent: true });
    batchOps++;
    updated++;

    if (batchOps >= BATCH_MAX) {
      await batch.commit();
      batch = db.batch();
      batchOps = 0;
    }
  }

  if (!options.dryRun && batchOps > 0) {
    await batch.commit();
  }

  return {
    dryRun: options.dryRun,
    totalDocs: snap.size,
    updated,
    alreadyTrue,
  };
}
