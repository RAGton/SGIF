import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import type { Transaction } from "@/types/database";

export function useTransactions(limit = 50, offset = 0) {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", limit, offset],
    queryFn: () =>
      apiClient
        .get<Transaction[]>(`/transactions?limit=${limit}&offset=${offset}`)
        .then((r) => r.data),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      account_id: string;
      category_id?: string;
      amount: number;
      description: string;
      transaction_type: "income" | "expense";
      date?: string;
      notes?: string;
      is_recurring?: boolean;
    }) => apiClient.post<Transaction>("/transactions", data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/transactions/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
