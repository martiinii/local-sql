"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@local-sql/ui/components/dropdown-menu";
import { toast } from "@local-sql/ui/components/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@local-sql/ui/components/tooltip";
import { InlineCode } from "@local-sql/ui/components/typography";
import { cn } from "@local-sql/ui/lib/utils";
import type { ComponentProps } from "react";
import React from "react";

const unwrapValue = (value: string | { value: string; label: string }) => {
  if (typeof value === "string") {
    return { value, label: null };
  }

  return value;
};

type InlineCodyCopyProps<T extends string, K extends T> = Omit<
  ComponentProps<"code">,
  "children"
> & {
  values: Record<T, string | { value: string; label: string }>;
  defaultRuntime: K;
};
export const InlineCodeCopy = <T extends string, K extends T>({
  values,
  defaultRuntime,
  className,
  ...props
}: InlineCodyCopyProps<T, K>) => {
  const script = unwrapValue(values[defaultRuntime]);

  const valuesArray = React.useMemo(() => {
    return (Object.keys(values) as T[]).map((runtime) => ({
      runtime,
      ...unwrapValue(values[runtime]),
    }));
  }, [values]);

  const copyValue = (runtime: T) => {
    navigator.clipboard.writeText(unwrapValue(values[runtime]).value);
    toast.success("Copied!");
  };

  return (
    <Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="cursor-pointer outline-none group/inline-code"
            >
              <InlineCode
                className={cn(
                  "select-none group-hover/inline-code:bg-muted/80 group-focus-visible/inline-code:bg-muted/80",
                  className,
                )}
                {...props}
              >
                {script.value}
              </InlineCode>
            </button>
          </TooltipTrigger>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {valuesArray.map(({ runtime, label }) => (
            <DropdownMenuItem key={runtime} onClick={() => copyValue(runtime)}>
              {label || runtime}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <TooltipContent side="right">Copy to clipboard</TooltipContent>
    </Tooltip>
  );
};
