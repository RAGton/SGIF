import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import CreateCategoryModal from "@/components/CreateCategoryModal";

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const { mutate: deleteCategory } = useDeleteCategory();
  const [showModal, setShowModal] = useState(false);

  const income = categories?.filter((c) => c.category_type === "income") ?? [];
  const expense = categories?.filter((c) => c.category_type === "expense") ?? [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold">Categorias</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium
                     px-4 py-2 rounded-lg transition"
        >
          + Nova categoria
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        {isLoading && <p className="text-gray-500 text-center py-12">Carregando...</p>}
        {error && <p className="text-red-400 text-center py-12">Erro ao carregar categorias.</p>}

        {!isLoading && (
          <>
            <Section
              title="Despesas"
              items={expense}
              onDelete={deleteCategory}
              emptyLabel="Nenhuma categoria de despesa"
            />
            <Section
              title="Receitas"
              items={income}
              onDelete={deleteCategory}
              emptyLabel="Nenhuma categoria de receita"
            />
          </>
        )}
      </main>

      {showModal && <CreateCategoryModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

interface SectionProps {
  title: string;
  items: { id: string; name: string; color: string }[];
  onDelete: (id: string) => void;
  emptyLabel: string;
}

function Section({ title, items, onDelete, emptyLabel }: SectionProps) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-gray-600 text-sm">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between bg-gray-900 border border-gray-800
                         rounded-xl px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color || "#6366f1" }}
                />
                <span className="font-medium">{cat.name}</span>
              </div>
              <button
                type="button"
                onClick={() => onDelete(cat.id)}
                className="text-gray-600 hover:text-red-400 transition text-sm"
                title="Excluir"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
