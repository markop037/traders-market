import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { adminAuth } from "@/lib/firebase-admin";
import { createR2Client, R2 } from "@/lib/cloudflare";

// Map toolId to R2 key (path in Indicators folder) and download filename
const INDICATOR_TOOLS: Record<string, { r2Key: string; filename: string }> = {
  "previous-high-low-toolkit": {
    r2Key: `${R2.INDICATORS_PREFIX}Previous HighLow Toolkit.ex5`,
    filename: "Previous HighLow Toolkit.ex5",
  },
  "previous-high-low-toolkit-sessions": {
    r2Key: `${R2.INDICATORS_PREFIX}Previous_HighLow_Toolkit_TZ.ex5`,
    filename: "Previous_HighLow_Toolkit_TZ.ex5",
  },
};

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.slice(7);
    await adminAuth.verifyIdToken(idToken);

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get("toolId");
    if (!toolId) {
      return NextResponse.json({ error: "Missing toolId" }, { status: 400 });
    }

    const indicator = INDICATOR_TOOLS[toolId];
    if (!indicator) {
      return NextResponse.json({ error: "Unknown tool" }, { status: 404 });
    }

    const r2 = createR2Client();
    let body: Readable;
    try {
      const result = await r2.send(
        new GetObjectCommand({ Bucket: R2.BUCKET, Key: indicator.r2Key })
      );
      body = result.Body as Readable;
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!body) {
      return NextResponse.json({ error: "No data" }, { status: 404 });
    }

    const buffer = await streamToBuffer(body);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${indicator.filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
