"use client";

import { DropdownMenuItem } from "@local-sql/ui/components/dropdown-menu";
import { Icons } from "@local-sql/ui/components/icons";
import { Skeleton } from "@local-sql/ui/components/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@local-sql/ui/components/toggle-group";
import { cn } from "@local-sql/ui/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeToggleGroupProps = {
  className?: string;
};
export const ThemeToggleGroup = ({ className }: ThemeToggleGroupProps) => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Skeleton className="rounded-full h-7 w-[5.25rem] md:h-6 md:w-[4.5rem] border border-input" />
    );
  }

  return (
    <ToggleGroup
      type="single"
      value={theme}
      variant={"outline"}
      onValueChange={(value: string) => {
        if (value) setTheme(value);
      }}
      size={"icon"}
      className={cn(className)}
    >
      <ToggleGroupItem value="light" aria-label="Enable light mode">
        <Icons.Sun />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Enable dark mode">
        <Icons.MoonStar />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="Use system color theme">
        <Icons.Computer />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export const ThemeToggleDropdownItems = () => {
  const { setTheme } = useTheme();

  return (
    <>
      <DropdownMenuItem onClick={() => setTheme("light")}>
        <Icons.Sun className="mr-2 size-4" />
        <span>Light</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>
        <Icons.MoonStar className="mr-2 size-4" />
        <span>Dark</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>
        <Icons.Computer className="mr-2 size-4" />
        <span>System</span>
      </DropdownMenuItem>
    </>
  );
};
