import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { clerkConfigured } from "@/lib/clerk-config";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (clerkConfigured()) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      redirect("/sign-in");
    }
  }

  return <AdminShell>{children}</AdminShell>;
}
