import { Button, type ButtonProps } from "@local-sql/ui/components/button";
import { Icons } from "@local-sql/ui/components/icons";
import { cn } from "@local-sql/ui/lib/utils";

type SubmitButtonProps = ButtonProps & {
  isSubmitting?: boolean;
};

const SubmitButton = ({
  disabled,
  isSubmitting,
  children,
  className,
  type,
  ...props
}: SubmitButtonProps) => {
  return (
    <Button
      disabled={isSubmitting || disabled}
      className={cn("relative", className)}
      type={type || "submit"}
      {...props}
    >
      <span
        className={cn("inline-flex items-center gap-2", {
          "opacity-0": isSubmitting,
        })}
      >
        {children}
      </span>
      {isSubmitting && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Icons.Loader className="size-4 animate-spin" />
        </div>
      )}
    </Button>
  );
};

export { SubmitButton, type SubmitButtonProps };
