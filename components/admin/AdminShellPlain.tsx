"use client";

import { AdminChrome } from "@/components/admin/AdminChrome";

export function AdminShellPlain({ children }: { children: React.ReactNode }) {
  return (
    <AdminChrome
      headerRight={
        <span className="hidden max-w-[220px] truncate text-right font-mono text-[10px] uppercase tracking-wider text-[var(--paragraph)]/80 sm:inline">
          Sin sesión · configurá Clerk
        </span>
      }
    >
      {children}
    </AdminChrome>
  );
}
