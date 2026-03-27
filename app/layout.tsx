import type { Metadata } from "next";
import { Manrope, Outfit } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Heritage Housing | Alquileres y Remodelaciones en Chile",
  description:
    "Encuentra tu próxima estadía perfecta o transforma tu hogar con nuestros servicios de remodelación profesional.",
  keywords: [
    "alquiler temporal Chile",
    "arriendo vacacional",
    "remodelaciones",
    "heritage housing",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${manrope.variable} ${outfit.variable}`}>
      <body className={`${manrope.className} min-h-screen bg-background antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
