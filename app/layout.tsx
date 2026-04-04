import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://ftc-analytics.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "FTC MatchPoint - Alliance predictions & event context",
  description:
    "FIRST Tech Challenge: compare 2×2 alliances, win odds from Scout stats, events, and teams.",
  applicationName: "FTC MatchPoint",
};

export const viewport: Viewport = {
  themeColor: "#05030a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#05030a] text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
