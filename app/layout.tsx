import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import ScrollIndicator from '@/components/scroll-indicator';
import PineappleLoader from '@/components/pineapple-loader';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pinya of The Dead",
  description: "A hardcore, immersive Project Zomboid roleplay experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
         {/* Highlight.js Theme */}
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PineappleLoader />
        {children}
        <ScrollIndicator />
        <Toaster position="top-center" theme="dark" toastOptions={{
          style: { backgroundColor: 'rgba(254, 212, 5, 0.3)', border: '1px solid #FED405', color: '#fff'}
        }} />
      </body>
    </html>
  );
}
