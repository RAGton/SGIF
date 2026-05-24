import { formatBRL } from "@/utils/currency";

interface StatCardProps {
  label: string;
  cents: number;
  tone?: "neutral" | "income" | "expense";
  icon?: React.ReactNode;
}

export function StatCard({ label, cents, tone = "neutral", icon }: StatCardProps) {
  const color =
    tone === "income" ? "text-green-400"
    : tone === "expense" ? "text-red-400"
    : "text-white";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{formatBRL(cents)}</p>
    </div>
  );
}
