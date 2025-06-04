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
import { CreateConnectionForm } from "./create-connection.form";

export const CreateConnectionDialog = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new connection</DialogTitle>
          <DialogDescription>
            Data will be saved locally and shared only with your Local SQL
            server
          </DialogDescription>
        </DialogHeader>
        <CreateConnectionForm noShadow onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
