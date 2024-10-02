"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "@/app/(dashboard)/transactions/columns";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useState } from "react";
import { UploadButton } from "@/app/(dashboard)/transactions/upload-button";
import { ImportCard } from "@/app/(dashboard)/transactions/import-card";
import { transactions as transactionSchema } from "@/db/schema";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { toast } from "sonner";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

export default function TransactionsPage() {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setVariant(VARIANTS.IMPORT);
    setImportResults(results);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  const bulkCreateMutation = useBulkCreateTransactions();
  const newTransaction = useNewTransaction();
  const transactionQuery = useGetTransactions();
  const transactions = transactionQuery.data || [];
  const deleteTransactions = useBulkDeleteTransactions(); // useQuery mutation

  const [ConfirmationDialog, confirm] = useSelectAccount(
    "Select Account",
    "Select the account to which the transactions will belong to",
  );

  const disableTable =
    transactionQuery.isLoading || deleteTransactions.isPending;

  function handleDeletion(selectedRows: unknown[]) {
    // @ts-ignore
    const selectedIds = selectedRows.map((item) => item.id);

    deleteTransactions.mutate({ ids: selectedIds });
  }

  const onSubmitImport = async (
    values: (typeof transactionSchema.$inferInsert)[],
  ) => {
    console.log("onsubmitImport before await confirm");
    const accountId = (await confirm()) as string | null | undefined;

    if (!accountId) {
      // accountId === null when don't select an account and press continue in dialog.
      toast.error("Failed to create transactions, please choose an account!");
      return;
    } else {
      // @ts-ignore
      if (accountId === "none") {
        // accountId === none when we cancel the account selection dialog.
        return;
      }
    }

    const readyData = values.map((value) => ({
      ...value,
      accountId: accountId,
    }));

    bulkCreateMutation.mutate(readyData, {
      onSuccess: () => onCancelImport(),
    });
  };

  if (transactionQuery.isLoading) {
    return (
      <Card className="border-none drop-shadow-sm pb-10 -mt-24">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-8 w-48" />
        </CardHeader>

        <CardContent>
          <div className="h-[500px] w-full flex items-center justify-center">
            <Loader2 className="size-6 text-slate-300 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />

        <ConfirmationDialog />
      </>
    );
  }

  return (
    <Card className="border-none drop-shadow-sm pb-10 -mt-24">
      <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-xl line-clamp-1">
          Transaction history.
        </CardTitle>
        <div className="flex items-center gap-x-2">
          <Button onClick={newTransaction.onOpen} size="sm">
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
          <UploadButton onUpload={onUpload} />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          onDelete={handleDeletion}
          columns={columns}
          data={transactions}
          filterKey="payee"
          disabled={disableTable}
        />
      </CardContent>
    </Card>
  );
}
