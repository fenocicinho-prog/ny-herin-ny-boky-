export function calculerCommission(prix: number): number {
  if (prix <= 50000) return prix * 0.08
  if (prix <= 90000) return prix * 0.07
  return prix * 0.05
}