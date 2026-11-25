import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { COLOR_MODE_KEY } from "@/lib/kit/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Field Operations · Unmap app",
  description: "A field-service starter built with Unmap and the Unmap component registry: sample work orders and crews, filters by category and status, a simulated task lifecycle, routes from base to site with relocation warnings, and live Canadian context layers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey={COLOR_MODE_KEY} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
