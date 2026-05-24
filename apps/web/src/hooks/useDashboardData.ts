import { useMemo } from "react";
import { useAccounts } from "./useAccounts";
import { useTransactions } from "./useTransactions";
import { useCategories } from "./useCategories";
import type { Account, Category, Transaction } from "@/types/database";

export interface CategorySlice {
  name: string;
  color: string;
  total: number;
}

export function useDashboardData() {
  const { data: accounts = [], isLoading: la } = useAccounts();
  const { data: transactions = [], isLoading: lt } = useTransactions(200, 0);
  const { data: categories = [], isLoading: lc } = useCategories();

  const data = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const totalBalance = accounts.reduce((sum: number, a: Account) => sum + a.current_balance, 0);

    const monthTx = transactions.filter((t: Transaction) => {
      const d = new Date(t.date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const monthIncome = monthTx
      .filter((t: Transaction) => t.amount > 0)
      .reduce((s: number, t: Transaction) => s + t.amount, 0);

    const monthExpense = monthTx
      .filter((t: Transaction) => t.amount < 0)
      .reduce((s: number, t: Transaction) => s + Math.abs(t.amount), 0);

    const catMap = new Map<string, CategorySlice>();
    for (const t of monthTx) {
      if (t.amount >= 0) continue;
      const cat = categories.find((c: Category) => c.id === t.category_id);
      const key = cat?.id ?? "sem-categoria";
      const name = cat?.name ?? "Sem categoria";
      const color = cat?.color ?? "#6B7280";
      const prev = catMap.get(key);
      catMap.set(key, { name, color, total: (prev?.total ?? 0) + Math.abs(t.amount) });
    }
    const expenseByCategory = Array.from(catMap.values()).sort((a, b) => b.total - a.total);

    const recent = [...transactions]
      .sort((a: Transaction, b: Transaction) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);

    return { totalBalance, monthIncome, monthExpense, expenseByCategory, accounts, recent, categories };
  }, [accounts, transactions, categories]);

  return { ...data, isLoading: la || lt || lc };
}
