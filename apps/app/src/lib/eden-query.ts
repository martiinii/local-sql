import type { ApiResponse } from "@local-sql/eden";

export type InferApiSuccessType<T> = T extends ApiResponse<
  Record<never, unknown>
>
  ? Extract<T, { error: null }>["data"]
  : T extends (...args: never) => Promise<infer R>
    ? R extends ApiResponse<Record<never, unknown>>
      ? Extract<R, { error: null }>["data"]
      : never
    : never;

export const unwrapEdenQuery = <
  A extends unknown[] | never,
  T extends ApiResponse<Record<never, unknown>>,
>(
  call: (...args: A) => Promise<T> | T,
): ((...args: A) => Promise<InferApiSuccessType<T>>) => {
  return async (...args: A) => {
    const response = await call(...args);
    if (response.error) {
      throw new Error(
        typeof response.error.value === "string"
          ? response.error.value
          : "An unknown error occured",
      );
    }

    return response.data as Promise<InferApiSuccessType<T>>;
  };
};
