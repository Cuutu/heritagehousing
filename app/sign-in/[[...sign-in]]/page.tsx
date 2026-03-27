"use client";

import dynamic from "next/dynamic";

const SignIn = dynamic(
  () => import("@clerk/nextjs").then((m) => m.SignIn),
  { ssr: false }
);

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
          Heritage Housing
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Acceso al panel de administración
        </p>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl={undefined}
        appearance={{
          variables: {
            colorPrimary: "#92400e",
            colorBackground: "#fafaf9",
            colorText: "#1c1917",
            colorTextSecondary: "#57534e",
            colorInputBackground: "#ffffff",
            colorNeutral: "#e7e5e4",
            borderRadius: "0.5rem",
          },
          elements: {
            card: "shadow-md border border-stone-200 bg-white",
            headerTitle: "text-stone-900",
            headerSubtitle: "text-stone-600",
            formButtonPrimary:
              "bg-amber-900 hover:bg-amber-950 text-sm normal-case",
            footerAction: "text-amber-900",
            identityPreviewText: "text-stone-800",
          },
        }}
      />
    </div>
  );
}
