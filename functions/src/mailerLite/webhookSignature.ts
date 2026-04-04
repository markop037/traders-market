import { createHmac, timingSafeEqual } from "node:crypto";

/** Verify MailerLite `Signature` header (HMAC-SHA256 of raw JSON body, hex digest). */
export function verifyMailerLiteWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  secret: string
): boolean {
  if (!signatureHeader?.trim() || !secret) return false;
  const expectedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signatureHeader.trim().toLowerCase();
  try {
    const a = Buffer.from(expectedHex, "utf8");
    const b = Buffer.from(received, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
