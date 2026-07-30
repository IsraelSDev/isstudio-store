export interface CommissionLine {
  productId: string;
  amount: number;
  /** Fração 0–1. Se omitida, usa a taxa padrão do tenant. */
  rate?: number;
}

/** Comissão recorrente mensal a pagar à agência. */
export function monthlyCommission(
  lines: CommissionLine[],
  defaultRate: number,
): number {
  return lines.reduce((total, line) => {
    const rate = line.rate ?? defaultRate;
    return total + line.amount * rate;
  }, 0);
}
