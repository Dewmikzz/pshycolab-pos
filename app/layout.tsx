import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { StoreInitializer } from "@/components/StoreInitializer";
import { ToastContainer } from "@/components/Toast";
import { ReceiptTemplate } from "@/components/ReceiptTemplate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POS Terminal",
  description: "Restaurant POS Cashier Screen",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Psycho Lab POS",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full`}
        suppressHydrationWarning
      >
        <MainLayout>
          <StoreInitializer />
          {children}
          <ReceiptTemplate />
          <ToastContainer />
        </MainLayout>
      </body>
    </html>
  );
}
