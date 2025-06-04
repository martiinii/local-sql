export const TailwindSizeIndicator = () => {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed right-0 bottom-0 text-xs size-7 rounded-tl-lg bg-foreground text-background grid place-items-center font-mono">
      <span className="block sm:hidden">XS</span>
      <span className="hidden sm:block md:hidden">SM</span>
      <span className="hidden md:block lg:hidden">MD</span>
      <span className="hidden lg:block xl:hidden">LG</span>
      <span className="hidden xl:block 2xl:hidden">XL</span>
      <span className="hidden 2xl:block">2XL</span>
    </div>
  );
};
