import { useAuth } from "@/hooks/useAuth";
import { useAccounts } from "@/hooks/useAccounts";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { data: accounts, isLoading } = useAccounts();

  const totalBalance =
    accounts?.reduce((sum, a) => sum + a.current_balance, 0) ?? 0;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 32, fontFamily: "sans-serif" }}>
      <header
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>SGIF</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#6b7280", fontSize: 14 }}>{user?.email}</span>
          <button
            onClick={() => void signOut()}
            style={{
              padding: "6px 14px",
              background: "transparent",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <section style={{ marginBottom: 32 }}>
        <p style={{ color: "#6b7280", margin: "0 0 4px", fontSize: 14 }}>Saldo Total</p>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
          {(totalBalance / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Contas</h2>
        {isLoading ? (
          <p style={{ color: "#6b7280" }}>Carregando...</p>
        ) : accounts && accounts.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {accounts.map((account) => (
              <li
                key={account.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <div>
                  <span style={{ fontWeight: 500 }}>{account.name}</span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: "#6b7280",
                      background: "#f3f4f6",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {account.account_type}
                  </span>
                </div>
                <span style={{ fontWeight: 600 }}>
                  {(account.current_balance / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: account.currency,
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6b7280" }}>Nenhuma conta cadastrada.</p>
        )}
      </section>
    </main>
  );
}
