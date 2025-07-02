"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@local-sql/ui/components/dialog";
import { type PropsWithChildren, useState } from "react";
import { query } from "@/query";
import { ServerForm } from "./server.form";

export const CreateServerDialog = ({ children }: PropsWithChildren) => {
  const { mutateAsync: createServer } = query.server.useCreateServer();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add secure gateway</DialogTitle>
          <DialogDescription>
            Enter the URL and access token from a remote instance to manage its
            databases here
          </DialogDescription>
        </DialogHeader>
        <ServerForm
          noShadow
          actionLabel="Add server"
          action={createServer}
          onSuccess={() => setIsOpen(false)}
          defaultValues={{
            name: "",
            url: "",
            token: "",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
