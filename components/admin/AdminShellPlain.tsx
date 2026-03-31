"use client";

import { AdminChrome } from "@/components/admin/AdminChrome";
import { clerkDisabled } from "@/lib/clerk-config";

export function AdminShellPlain({ children }: { children: React.ReactNode }) {
  const hint = clerkDisabled()
    ? "Clerk desactivado (NEXT_PUBLIC_CLERK_DISABLED)"
    : "Sin sesión · configurá Clerk";
  return (
    <AdminChrome
      headerRight={
        <span className="hidden max-w-[220px] truncate text-right font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]/80 sm:inline">
          {hint}
        </span>
      }
    >
      {children}
    </AdminChrome>
  );
}
