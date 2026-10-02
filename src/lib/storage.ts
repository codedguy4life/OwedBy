import AsyncStorage from "@react-native-async-storage/async-storage";

import { Debt } from "@/types/debt";

const STORAGE_KEY = "@owedby/debts";

export async function loadDebts(): Promise<Debt[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveDebts(debts: Debt[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
}
