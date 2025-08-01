"use client";

import { Button } from "@local-sql/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@local-sql/ui/components/card";
import { Icons } from "@local-sql/ui/components/icons";
import { H1, LargeMutedText } from "@local-sql/ui/components/typography";
import { RedirectType, redirect } from "next/navigation";
import { useEffect } from "react";
import { InlineCodeCopy } from "@/components/inline-code-copy";
import { query } from "@/query";
import { useAppStore } from "@/store/app.store";

export default function Page() {
  const isAppInitialized = useAppStore((state) => state.isConnected);
  const connectionTries = useAppStore((state) => state.connectionAttempts);

  const { mutate: initialize } = query.server.useInitialize(true);

  // Try to initialize connection every second
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        initialize(undefined, {
          onSettled: scheduleNext,
        });
      }, 1e3);
    };

    initialize(undefined, {
      onSettled: scheduleNext,
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialize]);

  if (isAppInitialized) {
    redirect("/dashboard", RedirectType.push);
  }

  if (!isAppInitialized && connectionTries === 0) {
    return (
      <main className="flex w-full h-svh items-center justify-center">
        <Icons.Loader className="animate-spin size-20 text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="flex w-full h-svh items-center justify-center p-10">
      <div className="space-y-10">
        <header className="space-y-2">
          <H1>Welcome to Local SQL</H1>
          <LargeMutedText className="inline-flex gap-2 items-center">
            Connecting to Local SQL Server on localhost:57597{" "}
            <Icons.Loader className="animate-spin" />
          </LargeMutedText>
        </header>
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex gap-2 items-center">
              <Icons.SquareTerminal className="size-6" /> Start server from CLI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Make sure your Local SQL server is running</p>
            <p>
              Run{" "}
              <InlineCodeCopy
                values={{
                  bun: "bunx --bun local-sql@latest --no-ui",
                  pnpm: "pnpm dlx local-sql@latest --no-ui",
                  npm: "npx local-sql@latest --no-ui",
                }}
                defaultRuntime="npm"
              />{" "}
              to start the server
            </p>
          </CardContent>
          <CardFooter>
            <Button variant={"outline"} asChild>
              <a
                href="https://github.com/martiinii/local-sql#readme"
                target="_blank"
                rel="noopener"
              >
                <Icons.Github /> GitHub repository
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
