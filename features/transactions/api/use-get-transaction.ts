import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetTransaction = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["transaction", { id }],
    queryFn: async () => {
      const response = await client.api.transactions[":id"].$get({
        param: { id: id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transaction");
      }

      const { data } = await response.json();

      // Modify the amount field in the returned data
      const modifiedData = data.map((transaction: any) => ({
        ...transaction,
        amount: convertAmountFromMiliunits(transaction.amount),
      }));

      return modifiedData;
    },
  });

  return query;
};
