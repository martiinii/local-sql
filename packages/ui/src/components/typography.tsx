import { cn } from "@local-sql/ui/lib/utils";
import type * as React from "react";

const H1 = ({ className, children, ...props }: React.ComponentProps<"h1">) => {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
};

const H2 = ({ className, children, ...props }: React.ComponentProps<"h2">) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
};

const H3 = ({ className, children, ...props }: React.ComponentProps<"h3">) => {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

const H4 = ({ className, children, ...props }: React.ComponentProps<"h4">) => {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
};

const LargeText = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </div>
  );
};

const LargeMutedText = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("text-lg font-medium text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
};

const SmallText = ({
  className,
  children,
  ...props
}: React.ComponentProps<"small">) => {
  return (
    <small
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    >
      {children}
    </small>
  );
};

const MutedText = ({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
};

const InlineCode = ({
  className,
  children,
  ...props
}: React.ComponentProps<"code">) => {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-1.5 py-1 font-mono text-sm font-semibold",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
};

const UL = ({ className, children, ...props }: React.ComponentProps<"ul">) => {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props}>
      {children}
    </ul>
  );
};

const OL = ({ className, children, ...props }: React.ComponentProps<"ol">) => {
  return (
    <ol
      className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </ol>
  );
};
export {
  H1,
  H2,
  H3,
  H4,
  LargeMutedText,
  LargeText,
  MutedText,
  SmallText,
  InlineCode,
  UL,
  OL,
};
