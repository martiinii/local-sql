import type * as React from "react";

import { cn } from "@local-sql/ui/utils";
import type { AnyFieldApi } from "@tanstack/react-form";

type TextareaProps = React.ComponentProps<"textarea"> & { field?: AnyFieldApi };
function Textarea({
  className,
  value,
  id,
  onBlurCapture,
  onBlur,
  onChange,
  field,
  ...props
}: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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

export { Textarea };
