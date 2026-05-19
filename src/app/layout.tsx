import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UMKMerpa - ERP SaaS untuk UMKM Indonesia",
  description: "Aplikasi ERP SaaS sederhana untuk Usaha Mikro, Kecil, dan Menengah di Indonesia. Kelola inventaris, penjualan, pembelian, keuangan, dan karyawan dalam satu platform.",
  keywords: ["UMKM", "ERP", "SaaS", "Indonesia", "inventaris", "penjualan", "keuangan"],
  authors: [{ name: "UMKMerpa" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
