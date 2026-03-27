"use client";

import dynamic from "next/dynamic";
import { clerkConfigured } from "@/lib/clerk-config";
import { AdminShellPlain } from "@/components/admin/AdminShellPlain";

const AdminShellWithClerk = dynamic(
  () =>
    import("@/components/admin/AdminShellWithClerk").then(
      (m) => m.AdminShellWithClerk
    ),
  { ssr: false }
);

export function AdminShell({ children }: { children: React.ReactNode }) {
  if (!clerkConfigured()) {
    return <AdminShellPlain>{children}</AdminShellPlain>;
  }
  return <AdminShellWithClerk>{children}</AdminShellWithClerk>;
}
