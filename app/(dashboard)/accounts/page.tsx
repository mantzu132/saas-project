"use client";

import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "@/app/(dashboard)/accounts/columns";
import { DataTable } from "@/components/data-table";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";

export default function AccountsPage() {
  const newAccount = useNewAccount();
  const accountsQuery = useGetAccounts();
  const accounts = accountsQuery.data || [];
  const deleteAccounts = useBulkDeleteAccounts(); // useQuery mutation

  const disableTable = accountsQuery.isLoading || deleteAccounts.isPending;

  function handleDeletion(selectedRows: unknown[]) {
    // @ts-ignore
    const selectedIds = selectedRows.map((item) => item.id);

    deleteAccounts.mutate({ ids: selectedIds });
  }

  if (accountsQuery.isLoading) {
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
        <CardTitle className="text-xl line-clamp-1">Accounts page</CardTitle>
        <Button onClick={newAccount.onOpen} size="sm">
          <Plus className="size-4 mr-2" />
          Add new
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          onDelete={handleDeletion}
          columns={columns}
          data={accounts}
          filterKey="name"
          disabled={disableTable}
        />
      </CardContent>
    </Card>
  );
}
