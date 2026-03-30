import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteHandlers = Awaited<
  ReturnType<
    Awaited<typeof import("uploadthing/next")>["createRouteHandler"]
  >
>;

let cachedHandlers: RouteHandlers | null = null;

async function getRouteHandlers(): Promise<RouteHandlers> {
  if (cachedHandlers) return cachedHandlers;
  await import("@/lib/uploadthing-env-init");
  const { createRouteHandler } = await import("uploadthing/next");
  const { ourFileRouter } = await import("./uploadthing-router");
  cachedHandlers = createRouteHandler({ router: ourFileRouter });
  return cachedHandlers;
}

export async function GET(req: NextRequest) {
  const { GET: handler } = await getRouteHandlers();
  return handler(req);
}

export async function POST(req: NextRequest) {
  const { POST: handler } = await getRouteHandlers();
  return handler(req);
}
