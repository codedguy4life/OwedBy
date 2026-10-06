import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { CurrencyCode } from "@/lib/currency";
import { cancelDebtReminder } from "@/lib/notifications";
import { loadDebts, saveDebts } from "@/lib/storage";
import { Debt, DebtCategory, DebtType, Payment, remainingAmount } from "@/types/debt";

type NewDebt = { person: string; amount: number; currency: CurrencyCode; type: DebtType; borrowedDate?: string; dueDate?: string; note: string; category: DebtCategory };
type DebtContextValue = { debts: Debt[]; loading: boolean; addDebt: (input: NewDebt) => Promise<Debt>; addPayment: (debtId: string, amount: number) => Promise<void>; deleteDebt: (debtId: string) => Promise<void>; setReminder: (debtId: string, reminderId?: string) => Promise<void>; getDebt: (debtId: string) => Debt | undefined; refresh: () => Promise<void> };

const DebtContext = createContext<DebtContextValue | null>(null);
const makeId = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);

export function DebtProvider({ children }: PropsWithChildren) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => { setLoading(true); setDebts(await loadDebts()); setLoading(false); };
  useEffect(() => { refresh(); }, []);
  const persist = async (next: Debt[]) => { setDebts(next); await saveDebts(next); };

  const addDebt = async (input: NewDebt) => {
    if (!input.person.trim()) throw new Error("Person is required.");
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Debt amount must be greater than zero.");
    const debt: Debt = { ...input, person: input.person.trim(), amount: input.amount, id: makeId(), createdAt: new Date().toISOString(), payments: [] };
    await persist([debt, ...debts]);
    return debt;
  };

  const addPayment = async (debtId: string, amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Payment must be greater than zero.");
    const currentDebt = debts.find((debt) => debt.id === debtId);
    if (!currentDebt) throw new Error("Debt not found.");
    if (remainingAmount(currentDebt) <= 0) throw new Error("This debt is already settled.");
    if (amount > remainingAmount(currentDebt)) throw new Error("Payment cannot be greater than the remaining balance.");
    const payment: Payment = { id: makeId(), amount, date: new Date().toISOString() };
    await persist(debts.map((debt) => debt.id === debtId ? { ...debt, payments: [...debt.payments, payment] } : debt));
  };

  const deleteDebt = async (debtId: string) => {
    const debt = debts.find((item) => item.id === debtId);
    if (debt?.reminderId) await cancelDebtReminder(debt.reminderId);
    await persist(debts.filter((item) => item.id !== debtId));
  };

  const setReminder = async (debtId: string, reminderId?: string) => {
    const current = debts.find((item) => item.id === debtId);
    if (current?.reminderId && current.reminderId !== reminderId) await cancelDebtReminder(current.reminderId);
    await persist(debts.map((debt) => debt.id === debtId ? { ...debt, reminderId } : debt));
  };

  const getDebt = (debtId: string) => debts.find((debt) => debt.id === debtId);
  const value = useMemo(() => ({ debts, loading, addDebt, addPayment, deleteDebt, setReminder, getDebt, refresh }), [debts, loading]);
  return <DebtContext.Provider value={value}>{children}</DebtContext.Provider>;
}

export function useDebts() {
  const context = useContext(DebtContext);
  if (!context) throw new Error("useDebts must be used inside DebtProvider");
  return context;
}
