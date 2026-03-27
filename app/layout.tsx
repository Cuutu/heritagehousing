import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
