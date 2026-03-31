"use client";

import type { ReactNode } from "react";

/** Proveedores cliente (sin Clerk aquí: va en `app/layout.tsx` cuando hay claves). */
export function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
