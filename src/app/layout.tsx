import type { Metadata, Viewport } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

import QueryProvider from "@/components/query-provider";

// Geist fonts provide pre-defined CSS variables and class names; no function call needed

export const metadata: Metadata = {
  title: "Pinbook - Your Personal Pinboard Client",
  description: "A modern, minimal Pinboard client for managing your bookmarks",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.pinboard.in" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.pinboard.in" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ToastProvider />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
