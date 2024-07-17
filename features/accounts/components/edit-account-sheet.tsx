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
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useGetAccount } from "@/features/accounts/api/use-get-account";

const formSchema = insertAccountsSchema.pick({ name: true });

type FormValues = z.input<typeof formSchema>;

export const EditAccountSheet = () => {
  const mutation = useCreateAccount();
  const { isOpen, onClose, id } = useOpenAccount();
  const accountQuery = useGetAccount(id);

  const defaultValues = accountQuery?.data
    ? { name: accountQuery?.data[0].name }
    : { name: "" };

  console.log(defaultValues);

  // TODO : CHANGE THIS TO EDIT ACCOUNT
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
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
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          disabled={mutation.isPending}
        />

        <SheetFooter>
          <SheetClose asChild></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
