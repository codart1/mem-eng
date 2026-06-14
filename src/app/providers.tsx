"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { ensureSeeded } from "@/lib/db/sample-data";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    ensureSeeded().catch((err) => console.error("Seeding failed", err));
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <TooltipProvider delay={200}>{children}</TooltipProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
