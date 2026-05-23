import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import type { Account } from "@/types/database";

export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: () => apiClient.get<Account[]>("/accounts").then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      account_type: "wallet" | "bank" | "credit_card" | "investment";
      currency?: string;
      initial_balance?: number;
      color?: string;
      icon?: string;
    }) => apiClient.post<Account>("/accounts", data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
