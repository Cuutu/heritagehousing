"use client";

import dynamic from "next/dynamic";
import { clerkConfigured } from "@/lib/clerk-config";

const ClerkProviderWrapper = dynamic(
  () =>
    import("./ClerkProviderWrapper").then((m) => m.ClerkProviderWrapper),
  { ssr: false }
);

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (!clerkConfigured()) {
    return <>{children}</>;
  }
  return <ClerkProviderWrapper>{children}</ClerkProviderWrapper>;
}
