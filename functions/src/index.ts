import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { DocumentData } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { backfillAllUserDocuments } from "./firestoreSync/backfillUserDocuments";
import { pruneOrphanUserDocs } from "./firestoreSync/pruneOrphanUserDocs";
import { setAllUsersEmailConsentTrue } from "./firestoreSync/setAllUsersEmailConsentTrue";
import { logger } from "firebase-functions";
import { defineSecret, defineString } from "firebase-functions/params";
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { DEFAULT_ALL_USERS_GROUP_ID } from "./mailerLite/config";
import { deleteMailerLiteSubscriberByEmail } from "./mailerLite/deleteSubscriber";
import { reconcileMailerLiteWithFirestore } from "./mailerLite/reconcileWithFirestore";
import { runHistoricalMailerLiteImport } from "./mailerLite/runHistoricalImport";
import { shouldSyncLiveEmailUser } from "./mailerLite/shouldSync";
import { syncFirestoreUserToMailerLite } from "./mailerLite/syncSubscriberState";
import type { FirestoreUser } from "./mailerLite/types";
import { verifyMailerLiteWebhookSignature } from "./mailerLite/webhookSignature";

const mailerliteApiToken = defineSecret("MAILERLITE_API_TOKEN");
const mailerliteBulkImportSecret = defineSecret("MAILERLITE_BULK_IMPORT_SECRET");
const mailerliteWebhookSecret = defineSecret("MAILERLITE_WEBHOOK_SECRET");
const mailerliteAllUsersGroupId = defineString("MAILERLITE_ALL_USERS_GROUP_ID", {
  default: DEFAULT_ALL_USERS_GROUP_ID,
});

const triggerOptions = {
  document: "users/{userId}",
  secrets: [mailerliteApiToken],
};

function snapshotToUser(data: DocumentData | undefined): FirestoreUser {
  if (!data) return {};
  return {
    email: data.email,
    createdAt: data.createdAt,
    hasPaid: data.hasPaid,
    paymentDate: data.paymentDate,
    paymentAmount: data.paymentAmount,
    paymentCurrency: data.paymentCurrency,
    stripeSessionId: data.stripeSessionId,
    firstName: data.firstName,
    lastName: data.lastName,
    location: data.location,
    dateOfBirth: data.dateOfBirth,
    emailConsent: data.emailConsent as FirestoreUser["emailConsent"],
  };
}

async function syncUserToMailerLite(
  user: FirestoreUser,
  context: string
): Promise<void> {
  const token = mailerliteApiToken.value();
  const allUsersGroupId = mailerliteAllUsersGroupId.value();

  if (!shouldSyncLiveEmailUser(user)) {
    logger.info(`MailerLite skip (${context}): no usable email`, {
      email: user.email,
    });
    return;
  }

  const result = await syncFirestoreUserToMailerLite(user, {
    apiToken: token,
    allUsersGroupId,
  });

  if (!result.ok) {
    logger.error(`MailerLite sync failed (${context})`, {
      email: user.email,
      status: result.status,
      bodySnippet: result.bodySnippet,
      action: result.action,
    });
    return;
  }

  logger.info(`MailerLite sync ok (${context})`, {
    email: user.email,
    action: result.action,
  });
}

export const onUserCreatedSyncMailerLite = onDocumentCreated(
  triggerOptions,
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const user = snapshotToUser(snap.data());
    await syncUserToMailerLite(user, "onCreate");
  }
);

export const onUserUpdatedSyncMailerLite = onDocumentUpdated(
  triggerOptions,
  async (event) => {
    const change = event.data;
    if (!change) return;

    const before = change.before.data() as FirestoreUser | undefined;
    const after = change.after.data() as FirestoreUser | undefined;
    if (!after) return;

    const hasPaidChanged = before?.hasPaid !== after.hasPaid;
    const emailConsentChanged = before?.emailConsent !== after.emailConsent;
    const emailChanged = before?.email !== after.email;
    const profileOrPaymentChanged =
      before?.paymentDate !== after.paymentDate ||
      before?.paymentAmount !== after.paymentAmount ||
      before?.paymentCurrency !== after.paymentCurrency ||
      before?.stripeSessionId !== after.stripeSessionId ||
      before?.firstName !== after.firstName ||
      before?.lastName !== after.lastName ||
      before?.location !== after.location ||
      before?.dateOfBirth !== after.dateOfBirth;

    if (
      !hasPaidChanged &&
      !emailConsentChanged &&
      !emailChanged &&
      !profileOrPaymentChanged
    ) {
      return;
    }

    const user = snapshotToUser(after);
    const reason = hasPaidChanged
      ? "onUpdate:hasPaid"
      : emailConsentChanged
        ? "onUpdate:emailConsent"
        : emailChanged
          ? "onUpdate:email"
          : "onUpdate:profileOrPayment";
    await syncUserToMailerLite(user, reason);
  }
);

export const onUserDeletedSyncMailerLite = onDocumentDeleted(
  triggerOptions,
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const user = snapshotToUser(snap.data());
    const token = mailerliteApiToken.value();

    if (!shouldSyncLiveEmailUser(user)) {
      logger.info("MailerLite delete skip (onDelete): no usable email", {
        email: user.email,
      });
      return;
    }

    const email = String(user.email).trim();
    const result = await deleteMailerLiteSubscriberByEmail(token, email);

    if (!result.ok) {
      logger.error("MailerLite delete failed (onDelete)", {
        email,
        status: result.status,
        bodySnippet: result.bodySnippet,
        action: result.action,
      });
      return;
    }

    logger.info("MailerLite delete ok (onDelete)", {
      email,
      action: result.action,
    });
  }
);

/**
 * MailerLite → Firestore: `subscriber.unsubscribed` updates `emailConsent` to `false`.
 * Verify `Signature` header (HMAC-SHA256 of raw body). Register in MailerLite with this URL.
 */
export const httpMailerLiteWebhook = onRequest(
  {
    secrets: [mailerliteWebhookSecret],
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const rawBody = (req as { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      logger.error("MailerLite webhook: missing rawBody");
      res.status(400).send("Bad Request");
      return;
    }

    const sig = req.get("Signature") ?? req.get("signature");
    if (
      !verifyMailerLiteWebhookSignature(rawBody, sig, mailerliteWebhookSecret.value())
    ) {
      logger.warn("MailerLite webhook: invalid signature");
      res.status(401).send("Unauthorized");
      return;
    }

    type Payload = { event?: string; email?: string };
    let payload: Payload;
    try {
      payload = JSON.parse(rawBody.toString("utf8")) as Payload;
    } catch {
      res.status(400).send("Invalid JSON");
      return;
    }

    if (payload.event !== "subscriber.unsubscribed") {
      res.status(200).send("OK");
      return;
    }

    const emailRaw = typeof payload.email === "string" ? payload.email.trim() : "";
    if (!emailRaw || !emailRaw.includes("@")) {
      res.status(200).send("OK");
      return;
    }

    if (!getApps().length) {
      initializeApp();
    }

    const db = getFirestore();
    const normalized = emailRaw.toLowerCase();

    try {
      let snap = await db
        .collection("users")
        .where("email", "==", normalized)
        .limit(25)
        .get();

      if (snap.empty && emailRaw !== normalized) {
        snap = await db
          .collection("users")
          .where("email", "==", emailRaw)
          .limit(25)
          .get();
      }

      if (snap.empty) {
        logger.info("MailerLite webhook unsubscribed: no Firestore user for email", {
          email: emailRaw,
        });
        res.status(200).send("OK");
        return;
      }

      const batch = db.batch();
      let updates = 0;
      for (const doc of snap.docs) {
        const cur = doc.get("emailConsent");
        if (cur === false) continue;
        batch.update(doc.ref, { emailConsent: false });
        updates++;
      }
      if (updates > 0) {
        await batch.commit();
        logger.info("MailerLite webhook: set emailConsent false", {
          email: emailRaw,
          docsUpdated: updates,
        });
      }
    } catch (e) {
      logger.error("MailerLite webhook: Firestore error", {
        err: e instanceof Error ? e.message : String(e),
        email: emailRaw,
      });
      res.status(500).send("Internal Server Error");
      return;
    }

    res.status(200).send("OK");
  }
);

/**
 * One-shot historical import (all users with a valid email → active or unsubscribed in MailerLite). POST only.
 * Header: X-MailerLite-Bulk-Import-Secret — must match secret MAILERLITE_BULK_IMPORT_SECRET.
 */
export const httpRunMailerLiteHistoricalImport = onRequest(
  {
    secrets: [mailerliteApiToken, mailerliteBulkImportSecret],
    timeoutSeconds: 540,
    memory: "512MiB",
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    const headerSecret = req.get("X-MailerLite-Bulk-Import-Secret");
    if (headerSecret !== mailerliteBulkImportSecret.value()) {
      logger.warn("Historical import HTTP: unauthorized");
      res.status(401).send("Unauthorized");
      return;
    }

    if (!getApps().length) {
      initializeApp();
    }

    const db = getFirestore();
    const token = mailerliteApiToken.value();
    const allUsersGroupId = mailerliteAllUsersGroupId.value();

    try {
      const summary = await runHistoricalMailerLiteImport(
        db,
        token,
        allUsersGroupId,
        {
          info: (msg, meta) => logger.info(msg, meta ?? {}),
          error: (msg, meta) => logger.error(msg, meta ?? {}),
        }
      );
      logger.info("Historical import finished", summary);
      res.status(200).json(summary);
    } catch (e) {
      logger.error("Historical import crashed", {
        err: e instanceof Error ? e.message : String(e),
      });
      res.status(500).json({
        error: e instanceof Error ? e.message : "Import failed",
      });
    }
  }
);

/**
 * MailerLite ↔ Firestore: removes **active** subscribers in the All Users group whose email is not
 * on any Firestore `users` doc, then re-imports all users with email so MailerLite **status** and fields match `emailConsent`.
 * POST. Header X-MailerLite-Bulk-Import-Secret. ?dryRun=true skips deletes and import.
 */
export const httpReconcileMailerLiteWithFirestore = onRequest(
  {
    secrets: [mailerliteApiToken, mailerliteBulkImportSecret],
    timeoutSeconds: 540,
    memory: "512MiB",
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    const headerSecret = req.get("X-MailerLite-Bulk-Import-Secret");
    if (headerSecret !== mailerliteBulkImportSecret.value()) {
      logger.warn("Reconcile MailerLite HTTP: unauthorized");
      res.status(401).send("Unauthorized");
      return;
    }

    const dryRun = req.query.dryRun === "true";

    if (!getApps().length) {
      initializeApp();
    }

    const db = getFirestore();
    const token = mailerliteApiToken.value();
    const allUsersGroupId = mailerliteAllUsersGroupId.value();

    try {
      const summary = await reconcileMailerLiteWithFirestore(
        db,
        token,
        allUsersGroupId,
        {
          dryRun,
          log: {
            info: (msg, meta) => logger.info(msg, meta ?? {}),
            error: (msg, meta) => logger.error(msg, meta ?? {}),
          },
        }
      );
      logger.info("MailerLite reconcile finished", summary);
      res.status(200).json(summary);
    } catch (e) {
      logger.error("MailerLite reconcile crashed", {
        err: e instanceof Error ? e.message : String(e),
      });
      res.status(500).json({
        error: e instanceof Error ? e.message : "Reconcile failed",
      });
    }
  }
);

/**
 * Sets `emailConsent: true` on all `users` docs where it is not already `true`.
 * POST only. Header X-MailerLite-Bulk-Import-Secret. Query ?dryRun=true
 */
export const httpSetAllUsersEmailConsentTrue = onRequest(
  {
    secrets: [mailerliteBulkImportSecret],
    timeoutSeconds: 540,
    memory: "256MiB",
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    const headerSecret = req.get("X-MailerLite-Bulk-Import-Secret");
    if (headerSecret !== mailerliteBulkImportSecret.value()) {
      logger.warn("Set emailConsent HTTP: unauthorized");
      res.status(401).send("Unauthorized");
      return;
    }

    const dryRun = req.query.dryRun === "true";

    if (!getApps().length) {
      initializeApp();
    }

    const db = getFirestore();

    try {
      const summary = await setAllUsersEmailConsentTrue(db, {
        dryRun,
        log: (msg, meta) => logger.info(msg, meta ?? {}),
      });
      logger.info("Set all users emailConsent finished", summary);
      res.status(200).json(summary);
    } catch (e) {
      logger.error("Set all users emailConsent crashed", {
        err: e instanceof Error ? e.message : String(e),
      });
      res.status(500).json({
        error: e instanceof Error ? e.message : "Update failed",
      });
    }
  }
);

/**
 * Normalizes all `users` docs: defaults, boolean `hasPaid` / `emailConsent`, profile empty strings,
 * removes unknown fields, strips payment fields when unpaid.
 * POST only. Header X-MailerLite-Bulk-Import-Secret. Query ?dryRun=true
 */
export const httpBackfillUserDocuments = onRequest(
  {
    secrets: [mailerliteBulkImportSecret],
    timeoutSeconds: 540,
    memory: "256MiB",
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    const headerSecret = req.get("X-MailerLite-Bulk-Import-Secret");
    if (headerSecret !== mailerliteBulkImportSecret.value()) {
      logger.warn("Backfill user documents HTTP: unauthorized");
      res.status(401).send("Unauthorized");
      return;
    }

    const dryRun = req.query.dryRun === "true";

    if (!getApps().length) {
      initializeApp();
    }

    const db = getFirestore();
    const auth = getAuth();

    try {
      const summary = await backfillAllUserDocuments(db, auth, {
        dryRun,
        log: (msg, meta) => logger.info(msg, meta ?? {}),
      });
      logger.info("Backfill user documents finished", summary);
      res.status(200).json(summary);
    } catch (e) {
      logger.error("Backfill user documents crashed", {
        err: e instanceof Error ? e.message : String(e),
      });
      res.status(500).json({
        error: e instanceof Error ? e.message : "Backfill failed",
      });
    }
  }
);

/**
 * Deletes Firestore `users/{uid}` when there is no Firebase Auth user with that uid.
 * POST only. Same auth as historical import: header X-MailerLite-Bulk-Import-Secret.
 * Query: ?dryRun=true to list orphans without deleting.
 */
export const httpPruneOrphanFirestoreUsers = onRequest(
  {
    secrets: [mailerliteBulkImportSecret],
    timeoutSeconds: 300,
    memory: "256MiB",
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    const headerSecret = req.get("X-MailerLite-Bulk-Import-Secret");
    if (headerSecret !== mailerliteBulkImportSecret.value()) {
      logger.warn("Prune Firestore users HTTP: unauthorized");
      res.status(401).send("Unauthorized");
      return;
    }

    const dryRun = req.query.dryRun === "true";

    if (!getApps().length) {
      initializeApp();
    }

    const db = getFirestore();
    const auth = getAuth();

    try {
      const summary = await pruneOrphanUserDocs(db, auth, {
        dryRun,
        log: (msg, meta) => logger.info(msg, meta ?? {}),
      });
      logger.info("Prune orphan user docs finished", summary);
      res.status(200).json(summary);
    } catch (e) {
      logger.error("Prune orphan user docs crashed", {
        err: e instanceof Error ? e.message : String(e),
      });
      res.status(500).json({
        error: e instanceof Error ? e.message : "Prune failed",
      });
    }
  }
);
