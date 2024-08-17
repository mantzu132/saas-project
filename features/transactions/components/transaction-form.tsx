import { insertTransactionsSchema } from "@/db/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Select } from "@/components/select";
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AmountInput } from "@/components/amount-input";
import { convertAmountToMiliunits } from "@/lib/utils";
const formSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  // categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
});

const apiSchema = insertTransactionsSchema.omit({ id: true });
type FormValues = z.input<typeof formSchema>; // the shape of the data that the form will handle

type ApiFormValues = z.input<typeof apiSchema>; // the shape of the data that will be sent to the API.

type Props = {
  id?: string;
  disabled: boolean;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  accountOptions: { label: string; value: string }[];
  onCreateAccount: (name: string) => void;
};

export const TransactionForm = ({
  id,
  onDelete,
  onSubmit,
  disabled,
  accountOptions,
  onCreateAccount,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleSubmit = (values: FormValues) => {
    const convertedAmount = convertAmountToMiliunits(parseFloat(values.amount));
    onSubmit({ ...values, amount: convertedAmount });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form className="space-y-2.5" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  {...field}
                  placeholder="Add a payee"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  disabled={disabled}
                  {...field}
                  placeholder="0.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="Optional notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <Select
                  placeholder={"Select an account"}
                  options={accountOptions}
                  onCreate={onCreateAccount}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={disabled} type="submit">
          {id ? "Edit transaction" : "Create transaction"}
        </Button>
      </form>
    </Form>
  );
};
