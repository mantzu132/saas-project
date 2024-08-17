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
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useCreateTransaction } from "@/features/transactions/api/use-create-transaction";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { Loader2 } from "lucide-react";

const formSchema = insertTransactionsSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;

export const NewTransactionSheet = () => {
  const transactionMutation = useCreateTransaction();
  const { isOpen, onClose } = useNewTransaction();

  const accountsQuery = useGetAccounts();
  const accountsMutation = useCreateAccount();
  const onCreateAccount = (name: string) => accountsMutation.mutate({ name });
  const accountOptions = (accountsQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  const isPending = transactionMutation.isPending || accountsMutation.isPending;

  const onSubmit = (values: FormValues) => {
    transactionMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New transaction</SheetTitle>
          <SheetDescription>Create a new transaction</SheetDescription>
        </SheetHeader>
        {accountsQuery.isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <TransactionForm
            onSubmit={onSubmit}
            disabled={isPending}
            accountOptions={accountOptions}
            onCreateAccount={onCreateAccount}
          />
        )}
        <SheetFooter>
          <SheetClose asChild></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
