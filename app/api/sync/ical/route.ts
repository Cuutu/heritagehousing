import { NextRequest, NextResponse } from "next/server";
import { syncAllIcalFeeds } from "@/lib/services/ical.service";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncAllIcalFeeds();

    return NextResponse.json({
      success: true,
      ...result,
      message: result.summaryMessage,
    });
  } catch (error) {
    console.error("iCal sync error:", error);
    return NextResponse.json(
      { error: "Error al sincronizar iCal" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to trigger iCal sync",
  });
}
