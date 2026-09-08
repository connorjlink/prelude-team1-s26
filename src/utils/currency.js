export function parsePrice(value) {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const str = String(value).trim();
  if (!str) return 0;
  // Remove commas first, then strip currency symbols / spaces, keep digits, dot and minus
  const noCommas = str.replace(/,/g, "");
  const cleaned = noCommas.replace(/[^0-9.\-]/g, "");
  if (!cleaned || cleaned === "." || cleaned === "-" || cleaned === "-.") return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function formatCurrency(value) {
  const amount = parsePrice(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
