import { useState } from "react";
import { useCreateAccount } from "@/hooks/useAccounts";
import { parseToCents } from "@/utils/currency";

interface Props {
  onClose: () => void;
}

const ACCOUNT_TYPES = [
  { value: "wallet", label: "Carteira" },
  { value: "bank", label: "Banco" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "investment", label: "Investimento" },
] as const;

const PRESET_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
];

type AccountType = (typeof ACCOUNT_TYPES)[number]["value"];

export default function CreateAccountModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("wallet");
  const [balanceInput, setBalanceInput] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [nameError, setNameError] = useState("");

  const { mutate, isPending, error } = useCreateAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Nome é obrigatório");
      return;
    }
    setNameError("");

    mutate(
      {
        name: name.trim(),
        account_type: accountType,
        currency: "BRL",
        initial_balance: balanceInput ? parseToCents(balanceInput) : 0,
        color,
        icon: accountType,
      },
      { onSuccess: onClose },
    );
  };

  const serverError =
    error instanceof Error ? error.message : error ? "Erro ao criar conta" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold">Nova conta</h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="Ex: Nubank, Carteira"
              maxLength={100}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
          </div>

          {/* Tipo */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Tipo</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white focus:outline-none focus:border-indigo-500"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Saldo inicial */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">
              Saldo inicial{" "}
              <span className="text-gray-600">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                R$
              </span>
              <input
                type="text"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5
                           text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Cor</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "white" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          {serverError && (
            <p className="text-red-400 text-sm">{serverError}</p>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300
                         hover:bg-gray-800 transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500
                         text-white font-medium transition disabled:opacity-50 text-sm"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
