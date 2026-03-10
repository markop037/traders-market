import { S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.TRADERS_MARKET_CLOUDFLARE_R2_ACCOUNT_ID!;
const accessKeyId = process.env.TRADERS_MARKET_CLOUDFLARE_R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.TRADERS_MARKET_CLOUDFLARE_R2_SECRET_ACCESS_KEY!;

export function createR2Client() {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing TRADERS_MARKET_CLOUDFLARE_R2_ACCOUNT_ID, TRADERS_MARKET_CLOUDFLARE_R2_ACCESS_KEY_ID, or TRADERS_MARKET_CLOUDFLARE_R2_SECRET_ACCESS_KEY'
    );
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export const R2 = {
  BUCKET: 'ea-traders-market',
  BOTS_PREFIX: 'Bots/',
} as const;
