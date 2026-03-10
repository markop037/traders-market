import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

// Map toolId to filename and placeholder content (replace with real files when implemented)
const TOOL_PLACEHOLDERS: Record<
  string,
  { filename: string; contentType: string; body: string }
> = {
  "position-size-calculator": {
    filename: "position-size-calculator.txt",
    contentType: "text/plain",
    body: "Position Size Calculator – Coming soon.\n\nThis tool will be available here once implemented. Stay tuned!",
  },
  "risk-reward-helper": {
    filename: "risk-reward-helper.txt",
    contentType: "text/plain",
    body: "Risk/Reward Helper – Coming soon.\n\nThis tool will be available here once implemented. Stay tuned!",
  },
  "session-times-cheatsheet": {
    filename: "session-times-cheatsheet.txt",
    contentType: "text/plain",
    body: "Trading Session Times Cheatsheet – Coming soon.\n\nThis tool will be available here once implemented. Stay tuned!",
  },
};

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

    const placeholder = TOOL_PLACEHOLDERS[toolId];
    if (!placeholder) {
      return NextResponse.json({ error: "Unknown tool" }, { status: 404 });
    }

    return new NextResponse(placeholder.body, {
      status: 200,
      headers: {
        "Content-Type": placeholder.contentType,
        "Content-Disposition": `attachment; filename="${placeholder.filename}"`,
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
