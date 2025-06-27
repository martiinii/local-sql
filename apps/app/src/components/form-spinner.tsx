import { Icons } from "@local-sql/ui/components/icons";

export const FormSpinner = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <Icons.Loader className="animate-spin size-12 text-muted-foreground" />
    </div>
  );
};
