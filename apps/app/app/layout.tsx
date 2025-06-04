import "@local-sql/ui/globals.css";

import { ConnectionsInitButton } from "@/features/dev/connections-init.button";
import { TailwindSizeIndicator } from "@/features/dev/tailwind-size-indicator";
import { QueryClientProvider } from "@/providers/query-client.provider";
import { Toaster } from "@local-sql/ui/components/sonner";
import { TooltipProvider } from "@local-sql/ui/components/tooltip";
import { cn } from "@local-sql/ui/lib/utils";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { PropsWithChildren } from "react";

const fontSans = Geist({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
});

const fontMonto = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Local SQL",
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
      </body>
    </html>
  );
}
