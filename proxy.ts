import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Middleware de Clerk (guía oficial).
 * Next.js solo ejecuta `middleware.ts` en la raíz; ese archivo reexporta este módulo.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
