import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetTransactions = () => {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("from") || "";
  const accountId = params.get("from") || "";

  const query = useQuery({
    queryKey: ["transactions", { from, to, accountId }],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: { from, to, accountId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const { data } = await response.json();

      return data.map((transaction) => ({
        ...transaction,
        amount: convertAmountFromMiliunits(transaction.amount),
      }));
    },
  });

  return query;
};
