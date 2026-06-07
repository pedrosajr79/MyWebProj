import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/lgpd/CookieBanner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Carrosseiro — Crie carrosséis virais para o Instagram com IA",
  description: "Gere carrosséis prontos para o Instagram em segundos usando Inteligência Artificial. Texto, design e exportação — tudo em um só lugar.",
  keywords: ["carrossel instagram", "ia conteúdo", "marketing digital", "criador de conteúdo"],
  openGraph: {
    title: "Carrosseiro — Carrosséis virais com IA",
    description: "Crie carrosséis profissionais para o Instagram em segundos.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        <CookieBanner />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
