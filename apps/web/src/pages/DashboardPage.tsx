import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts } from "@/hooks/useAccounts";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { data: accounts, isLoading } = useAccounts();
  const navigate = useNavigate();

  const totalBalance = accounts?.reduce((sum, a) => sum + a.current_balance, 0) ?? 0;

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

      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Saldo total</p>
            <p className="text-2xl font-bold mt-1">
              {(totalBalance / 100).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Receitas (mês)</p>
            <p className="text-2xl font-bold text-green-400 mt-1">R$ 0,00</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Despesas (mês)</p>
            <p className="text-2xl font-bold text-red-400 mt-1">R$ 0,00</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="font-semibold">Contas</h3>
          </div>
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">Carregando...</p>
          ) : accounts && accounts.length > 0 ? (
            <ul className="divide-y divide-gray-800">
              {accounts.map((account) => (
                <li key={account.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <span className="font-medium">{account.name}</span>
                    <span className="ml-2 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                      {account.account_type}
                    </span>
                  </div>
                  <span className="font-semibold">
                    {(account.current_balance / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: account.currency,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhuma conta cadastrada.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
