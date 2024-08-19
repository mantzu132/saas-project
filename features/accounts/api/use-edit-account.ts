import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["$patch"]
>;

type RequestType = InferRequestType<
  (typeof client.api.accounts)[":id"]["$patch"]
>["json"];

export const useEditAccount = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.accounts[":id"]["$patch"]({
        json,
        param: { id },
      });

      if (!response.ok) {
        // This will throw an error for non-2xx status codes
        throw new Error("Failed to update the account");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account updated");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account", { id }] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => {
      toast.error("Failed to update the account ");
    },
  });

  return mutation;
};
