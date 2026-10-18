export function sumAmounts(items: { amount: number }[] | undefined): number {
  return items?.reduce((sum, b) => sum + (b?.amount ?? 0), 0) ?? 0;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
