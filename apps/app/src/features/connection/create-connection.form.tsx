"use client";
import { query } from "@/query";
import {
  type FormProps,
  handleFormSubmit,
  useForm,
} from "@local-sql/ui/components/form";
import { Input } from "@local-sql/ui/components/input";
import { ShadowBox } from "@local-sql/ui/components/shadow-box";
import { SubmitButton } from "@local-sql/ui/components/submit-button";
import { type } from "arktype";

const CreateConnectionSchema = type({
  "+": "delete",
  name: "string > 0",
  uri: type("string.url").configure({ actual: "" }),
});

type CreateConnectionFormProps = FormProps & {
  serverId: string;
};
export const CreateConnectionForm = ({
  serverId,
  className,
  noShadow,
  onSuccess,
  onError,
}: CreateConnectionFormProps) => {
  const { mutateAsync: createConnection } = query.database.useCreateDatabase();

  const form = useForm({
    validators: {
      onSubmit: CreateConnectionSchema,
    },
    defaultValues: {
      name: "",
      uri: "",
    },
    onSubmit: async ({ value }) => {
      await createConnection(
        {
          serverId,
          ...value,
        },
        {
          onSuccess,
          onError,
        },
      );
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
                  <field.FormLabel>Database name</field.FormLabel>
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
                  <field.FormLabel>Database URI</field.FormLabel>
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
            Save database
          </SubmitButton>
        </ShadowBox>
      </form>
    </form.AppForm>
  );
};
