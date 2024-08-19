"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "@/app/(dashboard)/transactions/columns";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";

export default function TransactionsPage() {
  const newTransaction = useNewTransaction();
  const transactionQuery = useGetTransactions();
  const transactions = transactionQuery.data || [];
  const deleteTransactions = useBulkDeleteTransactions(); // useQuery mutation

  const disableTable =
    transactionQuery.isLoading || deleteTransactions.isPending;

  function handleDeletion(selectedRows: unknown[]) {
    // @ts-ignore
    const selectedIds = selectedRows.map((item) => item.id);

    deleteTransactions.mutate({ ids: selectedIds });
  }

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

  return (
    <Card className="border-none drop-shadow-sm pb-10 -mt-24">
      <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-xl line-clamp-1">
          Transaction history.
        </CardTitle>
        <Button onClick={newTransaction.onOpen} size="sm">
          <Plus className="size-4 mr-2" />
          Add new
        </Button>
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
