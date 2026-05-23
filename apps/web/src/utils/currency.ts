export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseToCents(input: string): number {
  const normalized = input.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? 0 : Math.round(value * 100);
}
