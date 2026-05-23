import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ width: 360, padding: 32, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 24 }}>SGIF</h1>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{ width: "100%", padding: "8px 12px", boxSizing: "border-box", fontSize: 16 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              style={{ width: "100%", padding: "8px 12px", boxSizing: "border-box", fontSize: 16 }}
            />
          </div>
          {error && (
            <p role="alert" style={{ color: "#dc2626", marginBottom: 12 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "10px",
              background: "#6C63FF",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
