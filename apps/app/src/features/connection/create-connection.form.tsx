"use client";
import { api } from "@/lib/api";
import { unwrapEdenQuery } from "@/lib/eden-query";
import { useServersStore } from "@/store/servers.store";
import {
  type FormProps,
  handleFormSubmit,
  useForm,
} from "@local-sql/ui/components/form";
import { Input } from "@local-sql/ui/components/input";
import { ShadowBox } from "@local-sql/ui/components/shadow-box";
import { toast } from "@local-sql/ui/components/sonner";
import { SubmitButton } from "@local-sql/ui/components/submit-button";
import { type } from "arktype";

const CreateConnectionSchema = type({
  "+": "delete",
  name: "string > 0",
  uri: type("string.url").configure({ actual: "" }),
});

export const CreateConnectionForm = ({
  className,
  noShadow,
  onSuccess,
  onError,
}: FormProps) => {
  const addConnection = useServersStore((state) => state.addConnection);
  const initializeSingleConnection = useServersStore(
    (state) => state.initializeSingleConnection,
  );

  const form = useForm({
    validators: {
      onSubmit: CreateConnectionSchema,
    },
    defaultValues: {
      name: "",
      uri: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const slug = addConnection(value);
        const [initializedDb] = await unwrapEdenQuery(api.init.post)({
          databases: [
            {
              name: slug,
              uri: value.uri,
            },
          ],
        });
        initializeSingleConnection(slug, initializedDb);

        onSuccess?.();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Unknown error occured");
        onError?.();
      }
    },
  });
  return (
    <form.AppForm>
      <form onSubmit={handleFormSubmit(form)}>
        <ShadowBox className={className} noShadow={noShadow}>
          <div className="flex flex-col gap-4">
            <form.AppField name="name">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel>Connection name (unique)</field.FormLabel>
                  <field.FormControl>
                    <Input field={field} />
                  </field.FormControl>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>

            <form.AppField name="uri">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel>Connection URI</field.FormLabel>
                  <field.FormControl>
                    <Input
                      placeholder="postgresql://..."
                      type="password"
                      autoComplete="new-password"
                      field={field}
                    />
                  </field.FormControl>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
          </div>

          <SubmitButton isSubmitting={form.state.isSubmitting}>
            Save connection
          </SubmitButton>
        </ShadowBox>
      </form>
    </form.AppForm>
  );
};
