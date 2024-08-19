"use client";

import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";
import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet";
import { EditTransactionSheet } from "@/features/transactions/components/edit-transaction-sheet";

export const SheetProvider = () => {
  return (
    <>
      <NewAccountSheet />
      <EditAccountSheet />
      <NewTransactionSheet />
      <EditTransactionSheet />
    </>
  );
};
