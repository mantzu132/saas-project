import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)["bulk-delete"]["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api.accounts)["bulk-delete"]["$post"]
>["json"];

export const useBulkDelete = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.accounts["bulk-delete"].$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account(s) deleted");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      // TODO: ALSO INVALIDATE SUMMARY
    },
    onError: () => {
      toast.error("Failed to delete account(s)");
    },
  });

  return mutation;
};
