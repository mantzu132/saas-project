import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$patch"]
>;

type RequestType = InferRequestType<
  (typeof client.api.transactions)[":id"]["$patch"]
>["json"];

export const useEditTransaction = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions[":id"]["$patch"]({
        json,
        param: { id },
      });

      if (!response.ok) {
        // This will throw an error for non-2xx status codes
        throw new Error("Failed to update the transaction");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Transaction updated");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", { id }] });
      // TODO:  INVALIDATE SUMMARY
    },
    onError: () => {
      toast.error("Failed to update the transaction ");
    },
  });

  return mutation;
};
