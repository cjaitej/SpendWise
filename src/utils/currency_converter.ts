export const currency = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 1,
});

export const compactCurrency = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  notation: "compact",
  compactDisplay: "short",
});
