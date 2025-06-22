"use client";

import { DataTable } from "@/components/table/data-table";
import { type InferQueryApiType, query } from "@/query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@local-sql/ui/components/dropdown-menu";
import { Icons } from "@local-sql/ui/components/icons";
import { SubmitButton } from "@local-sql/ui/components/submit-button";
import type { ColumnDef } from "@tanstack/react-table";

type Token = InferQueryApiType<typeof query.token.useTokens>[number];

export const columns = (serverId: string): ColumnDef<Token>[] => [
  {
    accessorKey: "token",
    header: "Token",
  },
  {
    id: "permission",
    header: "Permission",
    cell: ({ row: { original } }) => {
      return original.allowWrite ? "Write" : "Read";
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return <RowAction serverId={serverId} token={original} />;
    },
  },
];
type RowActionProps = {
  serverId: string;
  token: Token;
};
const RowAction = ({ serverId, token }: RowActionProps) => {
  const { mutate: changePermission, isPending: isPendingUpdate } =
    query.token.useUpdateToken();

  const { mutate: deleteToken, isPending: isPendingDelete } =
    query.token.useDeleteToken();

  const onChangePermission = () => {
    changePermission(
      {
        serverId,
        id: token.id,
        permission: token.allowWrite ? "read" : "write",
      },
      {
        onSuccess: () => {
          query.token.revalidateTokens(serverId);
        },
      },
    );
  };

  const onDelete = () => {
    deleteToken(
      {
        serverId,
        id: token.id,
      },
      {
        onSuccess: () => {
          query.token.revalidateTokens(serverId);
        },
      },
    );
  };

  const isPending = isPendingUpdate || isPendingDelete;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SubmitButton
          variant="ghost"
          className="size-8 p-0"
          isSubmitting={isPending}
        >
          <span className="sr-only">Open menu</span>
          <Icons.Ellipsis className="size-4" />
        </SubmitButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onChangePermission}>
          <Icons.Key /> Change to {token.allowWrite ? "Read" : "Write"}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Icons.Trash /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type TokenTableProps = {
  serverId: string;
  tokens: Token[];
};
export const TokenTable = ({ serverId, tokens }: TokenTableProps) => {
  return <DataTable columns={columns(serverId)} data={tokens} />;
};
