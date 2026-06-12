import type { Metadata, Viewport } from "next";
import { Google_Sans_Flex } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

import QueryProvider from "@/components/query-provider";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={googleSansFlex.variable}>
      <head>
        <link rel="preconnect" href="https://api.pinboard.in" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.pinboard.in" />
      </head>
      <body className="font-sans antialiased bg-background selection:bg-primary selection:text-primary-foreground">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="grid place-items-center w-screen min-h-screen">
              {children}
            </div>
            <ToastProvider />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Pinbook - Your Personal Pinboard Client",
  description: "A modern, minimal Pinboard client for managing your bookmarks",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};
