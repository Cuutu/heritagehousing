import { NextResponse } from "next/server";
import { clerkConfigured } from "@/lib/clerk-config";

export async function requireAdminApi(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  if (!clerkConfigured()) {
    return { ok: true };
  }
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }
  return { ok: true };
}
