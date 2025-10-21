import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Jobtegrity.oi — Job Scam Screening",
  description: "Screen job posts and emails for scam signals with transparent explanations.",
  metadataBase: new URL("https://jobtegrity.oi"),
  applicationName: "Jobtegrity.oi",
  keywords: [
    "job scam checker",
    "job screening",
    "fake job detector",
    "jobtegrity",
  ],
  openGraph: {
    title: "Jobtegrity.oi",
    description: "Screen job posts and emails for scam signals.",
    siteName: "Jobtegrity.oi",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
