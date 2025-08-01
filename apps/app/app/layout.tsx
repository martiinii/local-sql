import "@local-sql/ui/globals.css";

import { Toaster } from "@local-sql/ui/components/sonner";
import { TooltipProvider } from "@local-sql/ui/components/tooltip";
import { cn } from "@local-sql/ui/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { PropsWithChildren } from "react";
import { ConnectionsInitButton } from "@/features/dev/connections-init.button";
import { TailwindSizeIndicator } from "@/features/dev/tailwind-size-indicator";
import { QueryClientProvider } from "@/providers/query-client.provider";

const fontSans = Geist({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
});

const fontMonto = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const PRODUCTION_URL = "https://localsql.dev";

export const metadata: Metadata = {
  title: "Local SQL",
  description:
    "Local SQL is a privacy-focused, local-first database browser for managing and exploring your databases securely from your own machine.",
  metadataBase: new URL(
    process.env.VERCEL_ENV === "production"
      ? PRODUCTION_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : PRODUCTION_URL,
  ),
  openGraph: {
    url: PRODUCTION_URL,
    type: "website",
    siteName: "Local SQL",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontMonto.variable,
        )}
      >
        <NuqsAdapter>
          <QueryClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />

              {/* DEV */}
              <TailwindSizeIndicator />
              <ConnectionsInitButton />
            </ThemeProvider>
          </QueryClientProvider>
        </NuqsAdapter>
        {process.env.VERCEL_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
