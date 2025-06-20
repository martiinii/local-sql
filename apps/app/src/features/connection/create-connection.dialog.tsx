import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@local-sql/ui/components/dialog";
import type { OnChangeFn } from "@tanstack/react-table";
import { CreateConnectionForm } from "./create-connection.form";

type CreateConnectionDialogProps = {
  serverId: string;
  isOpen: boolean;
  setIsOpen: OnChangeFn<boolean>;
};
export const CreateConnectionDialog = ({
  serverId,
  isOpen,
  setIsOpen,
}: CreateConnectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add database connection</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <CreateConnectionForm
          noShadow
          serverId={serverId}
          onSuccess={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
