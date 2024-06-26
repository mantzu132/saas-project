"use client";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

export default function Home() {
  const { data: accounts, isLoading } = useGetAccounts();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log(accounts);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {accounts?.map((account) => <div key={account.id}>{account.name}</div>)}
    </main>
  );
}
