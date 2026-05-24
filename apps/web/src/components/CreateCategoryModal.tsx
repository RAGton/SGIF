import { useState } from "react";
import { useCreateCategory } from "@/hooks/useCategories";

interface Props {
  onClose: () => void;
}

const PRESET_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
];

type CategoryType = "income" | "expense";

export default function CreateCategoryModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryType>("expense");
  const [color, setColor] = useState(PRESET_COLORS[3]);
  const [nameError, setNameError] = useState("");

  const { mutate, isPending, error } = useCreateCategory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Nome é obrigatório");
      return;
    }
    setNameError("");
    mutate(
      { name: name.trim(), category_type: categoryType, color, icon: "tag" },
      { onSuccess: onClose },
    );
  };

  const serverError =
    error instanceof Error ? error.message : error ? "Erro ao criar categoria" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold">Nova categoria</h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Tipo */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCategoryType(t)}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  categoryType === t
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
              placeholder="Ex: Alimentação, Salário"
              maxLength={100}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
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
