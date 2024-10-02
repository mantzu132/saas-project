import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { Select } from "@/components/select";

export const useSelectAccount = (
  title: string,
  message: string,
): [() => JSX.Element, () => Promise<unknown>] => {
  const accountQuery = useGetAccounts();
  const [promise, setPromise] = useState<{
    resolve: (value: string | boolean) => void;
  } | null>(null);

  const accountsQuery = useGetAccounts();
  const accountOptions =
    accountsQuery.data?.map((account) => ({
      label: account.name,
      value: account.id,
    })) || [];
  const accountMutation = useCreateAccount();

  const selectValue = useRef<string>("");

  const onCreateAccount = (name: string) => accountMutation.mutate({ name });

  const confirm = () =>
    new Promise((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(selectValue.current);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve("none");
    handleClose();
  };

  const handleOpen = (state: boolean) => {
    state || handleCancel();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null} onOpenChange={handleOpen}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2 flex-col gap-4 sm:items-center">
          <Select
            options={accountOptions}
            onCreate={onCreateAccount}
            placeholder={"Select an account"}
            onChange={(value) => (selectValue.current = value)}
            disabled={accountQuery.isLoading || accountMutation.isPending}
          />

          <div className="flex justify-end gap-2 ">
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
