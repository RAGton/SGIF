import { useState } from "react";
import { Link } from "react-router-dom";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { formatBRL } from "@/utils/currency";
import CreateTransactionModal from "@/components/CreateTransactionModal";

export default function TransactionsPage() {
  const { data: transactions, isLoading, error } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { mutate: deleteTx, isPending: isDeleting } = useDeleteTransaction();
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.id, { name: c.name, color: c.color }]),
  );

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteTx(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold">Transações</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium
                     px-4 py-2 rounded-lg transition"
        >
          + Nova transação
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {isLoading && (
          <p className="text-gray-500 text-center py-12">Carregando...</p>
        )}

        {error && (
          <p className="text-red-400 text-center py-12">Erro ao carregar transações.</p>
        )}

        {!isLoading && !error && (!transactions || transactions.length === 0) && (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-500">Nenhuma transação ainda.</p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-indigo-400 hover:underline text-sm"
            >
              Lançar a primeira transação
            </button>
          </div>
        )}

        {transactions && transactions.length > 0 && (
          <ul className="space-y-2">
            {transactions.map((tx) => {
              const isIncome = tx.amount > 0;
              const cat = tx.category_id ? categoryMap[tx.category_id] : null;
              return (
                <li
                  key={tx.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4
                             flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{tx.description}</p>
                      {cat && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: cat.color + "33",
                            color: cat.color,
                          }}
                        >
                          {cat.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-500">{tx.date}</p>
                      {accountMap[tx.account_id] && (
                        <p className="text-xs text-gray-600">
                          {accountMap[tx.account_id]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p
                      className={`text-base font-semibold ${
                        isIncome ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isIncome ? "+" : ""}
                      {formatBRL(tx.amount)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(tx.id)}
                      disabled={isDeleting && deletingId === tx.id}
                      className="text-gray-600 hover:text-red-400 transition text-sm
                                 disabled:opacity-40"
                      title="Excluir"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {showModal && <CreateTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
