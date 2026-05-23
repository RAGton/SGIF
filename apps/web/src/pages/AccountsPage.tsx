import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccounts } from "@/hooks/useAccounts";
import { formatBRL } from "@/utils/currency";
import CreateAccountModal from "@/components/CreateAccountModal";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  wallet: "Carteira",
  bank: "Banco",
  credit_card: "Cartão de crédito",
  investment: "Investimento",
};

export default function AccountsPage() {
  const { data: accounts, isLoading, error } = useAccounts();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold">Minhas contas</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium
                     px-4 py-2 rounded-lg transition"
        >
          + Nova conta
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {isLoading && (
          <p className="text-gray-500 text-center py-12">Carregando...</p>
        )}

        {error && (
          <p className="text-red-400 text-center py-12">
            Erro ao carregar contas.
          </p>
        )}

        {!isLoading && !error && accounts?.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-500">Nenhuma conta ainda.</p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-indigo-400 hover:underline text-sm"
            >
              Criar a primeira conta
            </button>
          </div>
        )}

        {accounts && accounts.length > 0 && (
          <ul className="space-y-3">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5
                           flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: account.color || "#6366f1" }}
                  />
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded mt-1 inline-block">
                      {ACCOUNT_TYPE_LABELS[account.account_type] ?? account.account_type}
                    </span>
                  </div>
                </div>
                <p className="text-lg font-semibold">
                  {formatBRL(account.current_balance)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>

      {showModal && <CreateAccountModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
