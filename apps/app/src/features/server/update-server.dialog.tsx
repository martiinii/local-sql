"use client";

import { FormSpinner } from "@/components/form-spinner";
import { query } from "@/query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@local-sql/ui/components/dialog";
import type { OnChangeFn } from "@tanstack/react-table";
import { ServerForm, type ServerFormProps } from "./server.form";

type UpdateServerDialogProps = {
  serverId: string;
  isOpen: boolean;
  setIsOpen: OnChangeFn<boolean>;
  isLoading?: boolean;
  defaultValues?: ServerFormProps["defaultValues"];
};
export const UpdateServerDialog = ({
  serverId,
  isOpen,
  setIsOpen,
  isLoading,
  defaultValues,
}: UpdateServerDialogProps) => {
  const { mutateAsync: updateServer } = query.server.useUpdateServer();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update secure gateway</DialogTitle>
          <DialogDescription>
            Modify name, URL and access token to a remote instance
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <FormSpinner />
        ) : (
          <ServerForm
            noShadow
            actionLabel="Save changes"
            action={(data, actions) =>
              updateServer({ serverId, ...data }, actions)
            }
            onSuccess={() => {
              setIsOpen(false);
              query.server.revalidateServer(serverId);
            }}
            defaultValues={defaultValues}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
