import {
  type DefaultError,
  type QueryKey,
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type MutationFactoryOptions<TData, TError, TVariables, TContext> =
  UseMutationOptions<TData, TError, TVariables, TContext> & {
    invalidatePaths?: QueryKey[] | ((variables: TVariables) => QueryKey[]);
    successToast?: string | ((data: TData, vars: TVariables) => string);
    onErrorShowToast?: boolean;
  };
export const useCreateMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: MutationFactoryOptions<TData, TError, TVariables, TContext>,
) => {
  const {
    invalidatePaths = [],
    successToast,
    onErrorShowToast = true,
    onSuccess: onSuccessProp,
    onError: onErrorProps,
    ...mutationOptions
  } = options;
  const queryClient = useQueryClient();

  return useMutation({
    onError: (err, vars, ctx) => {
      console.error(err);
      if (onErrorProps) {
        onErrorProps(err as TError, vars as TVariables, ctx as TContext);
      }
      if (onErrorShowToast) {
        let description = "Unknown error";
        if (err instanceof Error) {
          description = err.message;
        }
        toast.error(description);
      }
    },

    onSuccess: (data, vars, ctx) => {
      if (onSuccessProp) {
        onSuccessProp(data as TData, vars as TVariables, ctx as TContext);
      }

      const invalidatePathsValue =
        typeof invalidatePaths === "function"
          ? invalidatePaths(vars)
          : invalidatePaths;

      for (const path of invalidatePathsValue) {
        queryClient.invalidateQueries({
          queryKey: path,
        });
      }

      if (successToast) {
        const toastTitleValue =
          typeof successToast === "function"
            ? successToast(data, vars)
            : successToast;
        toast.success(toastTitleValue);
      }
    },
    ...mutationOptions,
  });
};
