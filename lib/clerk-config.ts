/** True when real Clerk keys are set (not placeholders). Safe on server and client. */
export function clerkConfigured(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    pk.length > 40 &&
    (pk.startsWith("pk_test_") || pk.startsWith("pk_live_")) &&
    !pk.includes("xxxxx")
  );
}
