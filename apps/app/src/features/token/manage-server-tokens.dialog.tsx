"use client";

import type { ServerPermission } from "@local-sql/db-types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@local-sql/ui/components/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@local-sql/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@local-sql/ui/components/dropdown-menu";
import { Icons } from "@local-sql/ui/components/icons";
import { SubmitButton } from "@local-sql/ui/components/submit-button";
import { InlineCode } from "@local-sql/ui/components/typography";
import type { OnChangeFn } from "@tanstack/react-table";
import { FormSpinner } from "@/components/form-spinner";
import { query } from "@/query";
import type { Server } from "@/store/servers.store";
import { TokenTable } from "./token-table";

type ManageServerTokensDialogProps = {
  server: Server;
  isOpen: boolean;
  setIsOpen: OnChangeFn<boolean>;
};
export const ManageServerTokensDialog = ({
  server,
  isOpen,
  setIsOpen,
}: ManageServerTokensDialogProps) => {
  const { data: tokens, isPending } = query.token.useTokens({
    serverId: server.id,
  });

  const {
    mutate: createToken,
    isPending: isPendingCreate,
    data,
    reset,
  } = query.token.useCreateToken();

  const onTokenCreate = (permission: Exclude<ServerPermission, "none">) => {
    createToken(
      { serverId: server.id, permission },
      {
        onSuccess: () => {
          query.token.revalidateTokens(server.id);
        },
      },
    );
  };

  const onChangeOpen = (open: boolean) => {
    if (!open) {
      reset();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChangeOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {server.name} server tokens</DialogTitle>
          <DialogDescription>
            Create new, edit permissions or delete existing tokens for the
            server
          </DialogDescription>
        </DialogHeader>
        {isPending ? (
          <FormSpinner />
        ) : (
          <>
            <TokenTable serverId={server.id} tokens={tokens || []} />
            {data && (
              <Alert>
                <Icons.TriangleAlert />
                <AlertTitle>Save your token</AlertTitle>
                <AlertDescription className="flex flex-col min-w-0">
                  <p>
                    The token has been created, but you need to copy it now. You
                    won't be able to see it again.
                  </p>
                  <InlineCode className="block min-w-0 truncate">
                    {data.token}
                  </InlineCode>
                </AlertDescription>
              </Alert>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SubmitButton className="w-fit" isSubmitting={isPendingCreate}>
                  Add token <Icons.Plus />
                </SubmitButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onTokenCreate("read")}>
                  Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTokenCreate("write")}>
                  Write
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
