import { cn } from "@local-sql/ui/lib/utils";

type ShadowBoxProps = React.ComponentProps<"div"> & {
  noShadow?: boolean;
};
export const ShadowBox = ({
  className,
  children,
  noShadow,
  ...props
}: ShadowBoxProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-y-10 rounded-md lg:rounded-2xl",
        !noShadow &&
          "border p-12 bg-card shadow-lg/4 dark:shadow-muted-foreground/3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
