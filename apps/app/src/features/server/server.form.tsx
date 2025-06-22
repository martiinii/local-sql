"use client";
import {
  type FormProps,
  handleFormSubmit,
  useForm,
} from "@local-sql/ui/components/form";
import { Input } from "@local-sql/ui/components/input";
import { ShadowBox } from "@local-sql/ui/components/shadow-box";
import { SubmitButton } from "@local-sql/ui/components/submit-button";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { type } from "arktype";

const ServerSchema = type({
  "+": "delete",
  name: "string > 0",
  url: type("string.url").configure({ actual: "" }),
  "token?": "string",
});

export type ServerFormProps = FormProps & {
  defaultValues?: typeof ServerSchema.inferIn;
  action: UseMutateAsyncFunction<
    unknown,
    Error,
    typeof ServerSchema.inferOut,
    unknown
  >;
  actionLabel: string;
};
export const ServerForm = ({
  className,
  noShadow,
  onSuccess,
  onError,
  defaultValues,
  action,
  actionLabel,
}: ServerFormProps) => {
  const form = useForm({
    validators: {
      onSubmit: ServerSchema,
    },
    defaultValues,
    onSubmit: async ({ value }) => {
      await action(value, {
        onSuccess,
        onError,
      });
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
                  <field.FormLabel>Name</field.FormLabel>
                  <field.FormControl>
                    <Input field={field} />
                  </field.FormControl>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>

            <form.AppField name="url">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel>Server URL</field.FormLabel>
                  <field.FormControl>
                    <Input
                      placeholder="https://example.com:57597"
                      field={field}
                    />
                  </field.FormControl>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>

            <form.AppField name="token">
              {(field) => (
                <field.FormItem>
                  <field.FormLabel>Token</field.FormLabel>
                  <field.FormDescription>
                    Leave blank if your remote instance is not protected
                  </field.FormDescription>
                  <field.FormControl>
                    <Input placeholder="" field={field} />
                  </field.FormControl>
                  <field.FormMessage />
                </field.FormItem>
              )}
            </form.AppField>
          </div>

          <SubmitButton isSubmitting={form.state.isSubmitting}>
            {actionLabel}
          </SubmitButton>
        </ShadowBox>
      </form>
    </form.AppForm>
  );
};
