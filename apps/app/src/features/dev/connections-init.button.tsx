"use client";

import { Icons } from "@local-sql/ui/components/icons";
import { SubmitButton } from "@local-sql/ui/components/submit-button";
import { query } from "@/query";

export const ConnectionsInitButton = () => {
  const { mutate, isPending } = query.server.useInitialize();
  if (process.env.NODE_ENV === "production") return null;

  return (
    <SubmitButton
      className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-2"
      size={"sm"}
      variant={"outline"}
      isSubmitting={isPending}
      onClick={() => mutate()}
    >
      Initialize connections
      <Icons.Wrench />
    </SubmitButton>
  );
};
