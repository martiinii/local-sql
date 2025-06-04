import type { ApiResponse } from "@local-sql/eden";
import { toast } from "sonner";

export function withHandleError<T extends Record<PropertyKey, unknown>>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { data: NonNullable<T[200]> } {
  if (response.error) {
    handleErrorMessage(
      typeof response.error.value === "string"
        ? response.error.value
        : undefined,
    );
    return false;
  }

  return true;
}

export const handleErrorMessage = (message?: string) => {
  toast.error(
    message
      ? `An error occured, try again later: ${message}`
      : "An unknown error occured, try again later",
  );
};
