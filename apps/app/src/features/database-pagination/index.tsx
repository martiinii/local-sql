"use client";

import { Button } from "@local-sql/ui/components/button";
import { Icons } from "@local-sql/ui/components/icons";
import { Input } from "@local-sql/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@local-sql/ui/components/tooltip";
import { useDebounce } from "@uidotdev/usehooks";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { revalidateTable } from "@/query/table";
import { useAppStore } from "@/store/app.store";

export const DatabasePagination = () => {
  const appView = useAppStore((state) => state.view);

  if (!appView) return;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center font-mono *:focus-visible:z-1">
        <DatabasePaginationPreviousButton />
        <DatabasePaginationLimitInput />
        <DatabasePaginationOffsetInput />
        <DatabasePaginationNextButton />
      </div>
      <TableRefreshButton />
    </div>
  );
};

const DatabasePaginationPreviousButton = () => {
  const pagination = useAppStore((state) => state.pagination);
  const previousPage = useAppStore((state) => state.previousPage);

  const isEnabled = pagination.offset > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          disabled={!isEnabled}
          onClick={previousPage}
          className="rounded-r-none -mr-px"
          variant={"outline"}
          size={"icon"}
        >
          <Icons.ChevronLeft />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Previous page</TooltipContent>
    </Tooltip>
  );
};

const DatabasePaginationNextButton = () => {
  const nextPage = useAppStore((state) => state.nextPage);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={nextPage}
          className="rounded-l-none -ml-px"
          variant={"outline"}
          size={"icon"}
        >
          <Icons.ChevronRight />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Next page</TooltipContent>
    </Tooltip>
  );
};

type SyncedInputProps = {
  storeValue: number;
  setStoreValue: (value: number) => void;
  fallbackValue: number;
  maxValue?: number;
};
const useSyncedInput = ({
  storeValue,
  setStoreValue,
  fallbackValue,
  maxValue,
}: SyncedInputProps) => {
  const [inputValue, setInputValue] = useState(storeValue.toString());
  const debouncedValue = useDebounce(inputValue, 300);

  const lastCommittedValue = useRef(storeValue);

  useEffect(() => {
    if (storeValue !== lastCommittedValue.current) {
      setInputValue(storeValue.toString());
      lastCommittedValue.current = storeValue;
    }
  }, [storeValue]);

  useEffect(() => {
    if (debouncedValue === "") {
      const newValue = fallbackValue;
      lastCommittedValue.current = newValue;

      setStoreValue(newValue);
      return;
    }

    const numValue = Number.parseInt(debouncedValue, 10);
    if (!Number.isNaN(numValue)) {
      lastCommittedValue.current = numValue;

      setStoreValue(numValue);
    }
  }, [debouncedValue, setStoreValue, fallbackValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input
    if (value === "") {
      setInputValue(value);
      return;
    }

    // Only allow digits
    if (!/^\d+$/.test(value)) {
      return;
    }

    const numValue = Number.parseInt(value, 10);
    if (maxValue && numValue > maxValue) {
      setInputValue(maxValue.toString());
    } else {
      setInputValue(value);
    }
  };

  return { inputValue, handleInputChange };
};

const DatabasePaginationLimitInput = () => {
  const limit = useAppStore((state) => state.pagination.limit);
  const setPaginationLimit = useAppStore((state) => state.setPaginationLimit);

  const { inputValue, handleInputChange } = useSyncedInput({
    storeValue: limit,
    setStoreValue: setPaginationLimit,
    fallbackValue: 50,
    maxValue: 500,
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Input
          className="rounded-none text-center w-[calc(3ch+26px)]"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Limit"
        />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-mono uppercase">
        Limit
      </TooltipContent>
    </Tooltip>
  );
};

const DatabasePaginationOffsetInput = () => {
  const offset = useAppStore((state) => state.pagination.offset);
  const setPaginationOffset = useAppStore((state) => state.setPaginationOffset);

  const { inputValue, handleInputChange } = useSyncedInput({
    storeValue: offset,
    setStoreValue: setPaginationOffset,
    fallbackValue: 0,
  });

  const charLength = Math.min(Math.max(inputValue.length, 3), 8);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Input
          className="rounded-none text-center -ml-px"
          style={{
            width: `calc(${charLength}ch + 26px)`,
          }}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Offset"
        />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-mono uppercase">
        Offset
      </TooltipContent>
    </Tooltip>
  );
};

const TableRefreshButton = () => {
  const appView = useAppStore((state) => state.view);

  const onRevalidate = () => {
    if (!appView) return;

    revalidateTable({
      view: appView,
      clearCache: true,
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button onClick={onRevalidate} variant={"outline"} size={"icon"}>
          <Icons.RefreshCw />
          <span className="sr-only">Refresh rows</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Refresh rows</TooltipContent>
    </Tooltip>
  );
};
