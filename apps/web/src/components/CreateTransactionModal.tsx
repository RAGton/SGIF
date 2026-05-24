import { useState } from "react";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { parseToCents } from "@/utils/currency";

interface Props {
  onClose: () => void;
}

type TxType = "expense" | "income";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateTransactionModal({ onClose }: Props) {
  const [txType, setTxType] = useState<TxType>("expense");
  const [amountInput, setAmountInput] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [descError, setDescError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [amountError, setAmountError] = useState("");

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { mutate, isPending, error } = useCreateTransaction();

  const filtered = categories.filter((c) => c.category_type === txType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!description.trim()) {
      setDescError("Descrição é obrigatória");
      valid = false;
    } else {
      setDescError("");
    }
    if (!accountId) {
      setAccountError("Selecione uma conta");
      valid = false;
    } else {
      setAccountError("");
    }
    const cents = parseToCents(amountInput);
    if (cents <= 0) {
      setAmountError("Informe um valor maior que zero");
      valid = false;
    } else {
      setAmountError("");
    }
    if (!valid) return;

    // REGRA DE OURO: despesa → negativo, receita → positivo
    const amount = txType === "expense" ? -cents : cents;

    mutate(
      {
        account_id: accountId,
        category_id: categoryId || undefined,
        amount,
        description: description.trim(),
        transaction_type: txType,
        date,
      },
      { onSuccess: onClose },
    );
  };

  const serverError =
    error instanceof Error ? error.message : error ? "Erro ao lançar transação" : "";

  const isExpense = txType === "expense";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold">Nova transação</h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Tipo */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTxType(t);
                  setCategoryId("");
                }}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  txType === t
                    ? t === "expense"
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t === "expense" ? "Despesa" : "Receita"}
              </button>
            ))}
          </div>

          {/* Valor */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Valor</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                R$
              </span>
              <input
                type="text"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  if (amountError) setAmountError("");
                }}
                placeholder="0,00"
                inputMode="decimal"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5
                           text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {amountError && <p className="text-red-400 text-xs">{amountError}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descError) setDescError("");
              }}
              placeholder={isExpense ? "Ex: Mercado, Aluguel" : "Ex: Salário, Freelance"}
              maxLength={255}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            {descError && <p className="text-red-400 text-xs">{descError}</p>}
          </div>

          {/* Conta */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Conta</label>
            <select
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                if (accountError) setAccountError("");
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Selecionar conta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {accountError && <p className="text-red-400 text-xs">{accountError}</p>}
          </div>

          {/* Categoria */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">
              Categoria <span className="text-gray-600">(opcional)</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Sem categoria</option>
              {filtered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {serverError && <p className="text-red-400 text-sm">{serverError}</p>}

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
              className={`flex-1 py-2.5 rounded-lg text-white font-medium transition
                          disabled:opacity-50 text-sm ${
                            isExpense
                              ? "bg-red-600 hover:bg-red-500"
                              : "bg-green-600 hover:bg-green-500"
                          }`}
            >
              {isPending ? "Salvando..." : isExpense ? "Lançar despesa" : "Lançar receita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
