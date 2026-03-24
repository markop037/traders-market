import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { adminAuth } from "@/lib/firebase-admin";
import { createR2Client, R2 } from "@/lib/cloudflare";

// Map toolId to R2 key (path in Indicators folder) and download filename
const INDICATOR_TOOLS: Record<string, { r2Key: string; filename: string }> = {
  "previous-high-low-toolkit": {
    r2Key: `${R2.INDICATORS_PREFIX}DailyWeeklyMonthly HighLow Indicator.ex5`,
    filename: "DailyWeeklyMonthly HighLow Indicator.ex5",
  },
  "previous-high-low-toolkit-sessions": {
    r2Key: `${R2.INDICATORS_PREFIX}Session HighLow Indicator.ex5`,
    filename: "Session HighLow Indicator.ex5",
  },
  "session-marker": {
    r2Key: `${R2.INDICATORS_PREFIX}SessionMarker.ex5`,
    filename: "SessionMarker.ex5",
  },
  "atr-stop-loss-indicator": {
    r2Key: `${R2.INDICATORS_PREFIX}ATR StopLoss Indicator.ex5`,
    filename: "ATR StopLoss Indicator.ex5",
  },
  "drawdown-limiter-indicator": {
    r2Key: `${R2.INDICATORS_PREFIX}DrawdownLimiter.ex5`,
    filename: "DrawdownLimiter.ex5",
  },
  "risk-reward-visualizer-indicator": {
    r2Key: `${R2.INDICATORS_PREFIX}RiskRewardVisualizer.ex5`,
    filename: "RiskRewardVisualizer.ex5",
  },
  "pair-history-analyzer-indicator": {
    r2Key: `${R2.INDICATORS_PREFIX}PairHistoryAnalyzer.ex5`,
    filename: "PairHistoryAnalyzer.ex5",
  },
  "swing-high-low-scanner-indicator": {
    r2Key: `${R2.INDICATORS_PREFIX}SwingHighLowScanner.ex5`,
    filename: "SwingHighLowScanner.ex5",
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
