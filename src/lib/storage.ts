import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_CURRENCY, CurrencyCode } from "@/lib/currency";
import { Debt } from "@/types/debt";

const STORAGE_KEY = "@owedby/debts";

export async function loadDebts(): Promise<Debt[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((debt) => ({
      ...debt,
      currency: (debt.currency ?? DEFAULT_CURRENCY) as CurrencyCode,
      category: debt.category ?? "general",
      payments: Array.isArray(debt.payments) ? debt.payments : [],
    }));
  } catch {
    return [];
  }
}

export async function saveDebts(debts: Debt[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
}
