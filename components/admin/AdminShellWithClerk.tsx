"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { AdminChrome } from "@/components/admin/AdminChrome";

export function AdminShellWithClerk({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  return (
    <AdminChrome
      headerRight={
        <>
          <span className="hidden max-w-[200px] truncate text-sm text-[var(--paragraph)] sm:inline">
            {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? ""}
          </span>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-[var(--brand-border)]",
              },
            }}
          />
        </>
      }
    >
      {children}
    </AdminChrome>
  );
}
