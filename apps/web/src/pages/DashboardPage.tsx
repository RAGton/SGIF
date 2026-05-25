import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatCard } from "@/components/StatCard";
import { ExpenseChart } from "@/components/ExpenseChart";
import { formatBRL } from "@/utils/currency";

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  wallet: "Carteira",
  bank: "Conta bancária",
  credit_card: "Cartão de crédito",
  investment: "Investimento",
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const d = useDashboardData();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">SGIF</h1>
        <nav className="flex items-center gap-6">
          <Link to="/accounts" className="text-sm text-gray-400 hover:text-white transition">
            Contas
          </Link>
          <Link to="/transactions" className="text-sm text-gray-400 hover:text-white transition">
            Transações
          </Link>
          <Link to="/categories" className="text-sm text-gray-400 hover:text-white transition">
            Categorias
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {d.isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-500">
            Carregando...
          </div>
        ) : (
          <>
            {/* Linha 1: resumo financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Saldo total" cents={d.totalBalance} />
              <StatCard label="Receitas (mês)" cents={d.monthIncome} tone="income" />
              <StatCard label="Despesas (mês)" cents={d.monthExpense} tone="expense" />
            </div>

            {/* Linha 2: gráfico + contas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-4">Despesas por categoria</h3>
                <ExpenseChart data={d.expenseByCategory} />
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-4">Contas</h3>
                {d.accounts.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Nenhuma conta cadastrada.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {d.accounts.map((a) => (
                      <li key={a.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: a.color || "#6366f1" }}
                          />
                          <div>
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-gray-500">
                              {ACCOUNT_TYPE_LABEL[a.account_type] ?? a.account_type}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatBRL(a.current_balance)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Linha 3: últimas transações */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4">Últimas transações</h3>
              {d.recent.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">
                  Nenhuma transação lançada ainda.
                </p>
              ) : (
                <ul className="divide-y divide-gray-800">
                  {d.recent.map((tx) => {
                    const cat = d.categories.find((c) => c.id === tx.category_id);
                    return (
                      <li
                        key={tx.id}
                        className="flex items-center justify-between py-3 gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500">{tx.date}</p>
                            {cat && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: (cat.color || "#6366f1") + "33",
                                  color: cat.color || "#6366f1",
                                }}
                              >
                                {cat.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-semibold flex-shrink-0 ${
                            tx.amount > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {formatBRL(tx.amount)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
