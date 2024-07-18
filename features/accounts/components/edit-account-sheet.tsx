import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AccountForm } from "@/features/accounts/components/account-form";
import { insertAccountsSchema } from "@/db/schema";
import { z } from "zod";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useGetAccount } from "@/features/accounts/api/use-get-account";
import { useEditAccount } from "@/features/accounts/api/use-edit-account";

const formSchema = insertAccountsSchema.pick({ name: true });

type FormValues = z.input<typeof formSchema>;

export const EditAccountSheet = () => {
  const { isOpen, onClose, id } = useOpenAccount();
  const editMutation = useEditAccount(id);
  const accountQuery = useGetAccount(id);

  const defaultValues = accountQuery?.data
    ? { name: accountQuery?.data[0].name }
    : { name: "" };

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit account</SheetTitle>
          <SheetDescription>Here you can edit your account</SheetDescription>
        </SheetHeader>

        <AccountForm
          id={id}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          disabled={editMutation.isPending}
        />

        <SheetFooter>
          <SheetClose asChild></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
