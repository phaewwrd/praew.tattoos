const thb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** "START AT 1,500 THB" */
export function startAt(priceThb: number): string {
  return `START AT ${thb.format(priceThb)} THB`;
}
