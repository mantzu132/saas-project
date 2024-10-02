import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>["json"];

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions["bulk-create"].$post({
        json,
      });

      if (!response.ok) {
        // This will throw an error for non-2xx status codes
        throw new Error("Failed to create the transactions");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("transaction(s) deleted");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // TODO: ALSO INVALIDATE SUMMARY
    },
    onError: () => {
      toast.error("Failed to create transactions");
    },
  });

  return mutation;
};
