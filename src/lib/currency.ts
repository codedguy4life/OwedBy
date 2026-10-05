export type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR" | "GHS" | "KES" | "ZAR" | "CAD" | "AUD" | "JPY" | "INR";

export type CurrencyInfo = { code: CurrencyCode; name: string; symbol: string; locale: string };

export const CURRENCIES: CurrencyInfo[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", locale: "en-NG" },
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", locale: "en-GH" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", locale: "en-KE" },
  { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
];

export const DEFAULT_CURRENCY: CurrencyCode = "NGN";

export function getCurrency(code: CurrencyCode) {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}

export function formatMoney(value: number, code: CurrencyCode) {
  return new Intl.NumberFormat(getCurrency(code).locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "JPY" ? 0 : 2,
  }).format(value);
}

export function currencySymbol(code: CurrencyCode) {
  return getCurrency(code).symbol;
}
