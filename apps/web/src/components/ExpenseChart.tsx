import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatBRL } from "@/utils/currency";
import type { CategorySlice } from "@/hooks/useDashboardData";

export function ExpenseChart({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        Sem despesas neste mês
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={192}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius={52} outerRadius={88} paddingAngle={2}>
            {data.map((s, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [typeof value === "number" ? formatBRL(value) : String(value), ""]}
            contentStyle={{
              background: "#111827",
              border: "1px solid #1F2937",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="mt-3 space-y-1.5">
        {data.map((s) => (
          <li key={s.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-gray-300 truncate max-w-32">{s.name}</span>
            </div>
            <span className="text-gray-400 font-medium">{formatBRL(s.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
