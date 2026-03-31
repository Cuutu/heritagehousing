/**
 * Apaga Clerk sin borrar claves (evita banner dev, accounts.dev, etc.).
 * En Vercel/local: NEXT_PUBLIC_CLERK_DISABLED=true
 */
export function clerkDisabled(): boolean {
  const v = (process.env.NEXT_PUBLIC_CLERK_DISABLED ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** True when Clerk está activo: claves reales y no desactivado explícitamente. */
export function clerkConfigured(): boolean {
  if (clerkDisabled()) return false;
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    pk.length > 40 &&
    (pk.startsWith("pk_test_") || pk.startsWith("pk_live_")) &&
    !pk.includes("xxxxx")
  );
}
