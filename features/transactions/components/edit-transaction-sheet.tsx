import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertTransactionsSchema } from "@/db/schema";
import { z } from "zod";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { useEditTransaction } from "@/features/transactions/api/use-edit-transaction";
import { useGetTransaction } from "@/features/transactions/api/use-get-transaction";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";

const formSchema = insertTransactionsSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;

export const EditTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenTransaction();
  const editMutation = useEditTransaction(id);
  const TransactionQuery = useGetTransaction(id);

  const accountsQuery = useGetAccounts();
  const accountsMutation = useCreateAccount();
  const onCreateAccount = (name: string) => accountsMutation.mutate({ name });
  const accountOptions = (accountsQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  const defaultValues = TransactionQuery?.data
    ? {
        accountId: TransactionQuery.data[0]?.accountId || "",
        categoryId: TransactionQuery.data[0]?.categoryId || "",
        amount: TransactionQuery.data[0]?.amount.toString() || "",
        date: TransactionQuery.data[0]?.date
          ? new Date(TransactionQuery.data[0].date)
          : new Date(),
        payee: TransactionQuery.data[0]?.payee || "",
        notes: TransactionQuery.data[0]?.notes || "",
      }
    : {
        accountId: "",
        categoryId: "",
        amount: "",
        date: new Date(),
        payee: "",
        notes: "",
      };

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const isPending = editMutation.isPending || accountsMutation.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit transaction</SheetTitle>
          <SheetDescription>
            Here you can edit your transaction
          </SheetDescription>
        </SheetHeader>

        <TransactionForm
          id={id}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          accountOptions={accountOptions}
          disabled={isPending}
          onCreateAccount={onCreateAccount}
        />

        <SheetFooter>
          <SheetClose asChild></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
