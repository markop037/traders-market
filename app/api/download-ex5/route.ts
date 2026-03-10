import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { Readable } from 'stream';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createR2Client, R2 } from '@/lib/cloudflare';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * GET /api/download-ex5?name=file.ex5  -> download single file
 * GET /api/download-ex5                -> download all .ex5 files as zip
 */
export async function GET(request: NextRequest) {
  try {
    const r2 = createR2Client();
    const { searchParams } = new URL(request.url);
    const singleName = searchParams.get('name');

    if (singleName) {
      if (!singleName.toLowerCase().endsWith('.ex5')) {
        return NextResponse.json(
          { error: 'Only .ex5 files are allowed' },
          { status: 400 }
        );
      }

      const key = `${R2.BOTS_PREFIX}${singleName}`;
      let body: Readable | null = null;

      try {
        const result = await r2.send(
          new GetObjectCommand({ Bucket: R2.BUCKET, Key: key })
        );
        body = result.Body as Readable;
      } catch {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      if (!body) {
        return NextResponse.json({ error: 'No data' }, { status: 404 });
      }

      const buffer = await streamToBuffer(body);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${singleName}"`,
          'Content-Length': String(buffer.length),
        },
      });
    }

    // Zip all .ex5 files from the Bots folder
    const listResult = await r2.send(
      new ListObjectsV2Command({
        Bucket: R2.BUCKET,
        Prefix: R2.BOTS_PREFIX,
        MaxKeys: 1000,
      })
    );

    const ex5Objects = (listResult.Contents ?? []).filter((obj) =>
      obj.Key?.toLowerCase().endsWith('.ex5')
    );

    if (ex5Objects.length === 0) {
      return NextResponse.json(
        { error: 'No .ex5 files found in Cloudflare storage' },
        { status: 404 }
      );
    }

    const archive = archiver('zip', { zlib: { level: 6 } });
    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));

    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });

    for (const obj of ex5Objects) {
      const key = obj.Key!;
      const filename = key.slice(R2.BOTS_PREFIX.length);
      try {
        const result = await r2.send(
          new GetObjectCommand({ Bucket: R2.BUCKET, Key: key })
        );
        const buf = await streamToBuffer(result.Body as Readable);
        archive.append(buf, { name: filename });
      } catch {
        continue;
      }
    }

    archive.finalize();
    const zipBuffer = await zipPromise;

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="ea-bots-ex5.zip"',
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (err) {
    console.error('Download API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
