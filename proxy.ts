import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkDisabled } from "@/lib/clerk-config";

/**
 * Middleware de Clerk (guía oficial).
 * Next.js solo ejecuta `middleware.ts` en la raíz; ese archivo reexporta este módulo.
 * Si `NEXT_PUBLIC_CLERK_DISABLED=true`, no se ejecuta Clerk (sin sesión / sin banner).
 */
export default clerkDisabled()
  ? () => NextResponse.next()
  : clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
