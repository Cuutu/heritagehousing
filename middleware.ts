import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Passthrough — admin protection uses `app/(admin)/layout.tsx` + Clerk `auth()` when configured. */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
