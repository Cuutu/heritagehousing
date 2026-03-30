import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runCleaningCronJob } from "@/lib/cleaning/cleaning-notifications";

const querySchema = z.object({
  secret: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const parsed = querySchema.safeParse({ secret: secret ?? "" });
  if (!parsed.success || parsed.data.secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCleaningCronJob();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
