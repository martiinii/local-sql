import { cn } from "@local-sql/ui/utils";
import type { AnyFieldApi } from "@tanstack/react-form";
import type * as React from "react";

type InputProps = React.ComponentProps<"input"> & { field?: AnyFieldApi };
function Input({
  className,
  type,
  value,
  id,
  onBlurCapture,
  onBlur,
  onChange,
  field,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      id={id ?? props.name}
      value={field?.state.value ?? value}
      onBlur={field?.handleBlur ?? onBlur}
      onChange={
        field?.handleChange
          ? (e) => field.handleChange(e.target.value)
          : onChange
      }
      {...props}
    />
  );
}

export { Input };
