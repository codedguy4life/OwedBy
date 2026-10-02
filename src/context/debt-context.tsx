import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { loadDebts, saveDebts } from "@/lib/storage";
import { Debt, DebtType, Payment, remainingAmount } from "@/types/debt";

type NewDebt = {
  person: string;
  amount: number;
  type: DebtType;
  dueDate: string;
  note: string;
};

type DebtContextValue = {
  debts: Debt[];
  loading: boolean;
  addDebt: (input: NewDebt) => Promise<Debt>;
  addPayment: (debtId: string, amount: number) => Promise<void>;
  deleteDebt: (debtId: string) => Promise<void>;
  getDebt: (debtId: string) => Debt | undefined;
  totalOwedToMe: number;
  totalIOwe: number;
  refresh: () => Promise<void>;
};

const DebtContext = createContext<DebtContextValue | null>(null);

export function DebtProvider({ children }: PropsWithChildren) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const stored = await loadDebts();
    setDebts(stored);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const persist = async (next: Debt[]) => {
    setDebts(next);
    await saveDebts(next);
  };

  const addDebt = async (input: NewDebt) => {
    const debt: Debt = {
      ...input,
      id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      payments: [],
    };
    await persist([debt, ...debts]);
    return debt;
  };

  const addPayment = async (debtId: string, amount: number) => {
    const payment: Payment = {
      id: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9),
      amount,
      date: new Date().toISOString(),
    };
    const next = debts.map((debt) =>
      debt.id === debtId ? { ...debt, payments: [...debt.payments, payment] } : debt,
    );
    await persist(next);
  };

  const deleteDebt = async (debtId: string) => {
    await persist(debts.filter((debt) => debt.id !== debtId));
  };

  const getDebt = (debtId: string) => debts.find((debt) => debt.id === debtId);

  const totals = useMemo(
    () => ({
      totalOwedToMe: debts
        .filter((debt) => debt.type === "they_owe_me")
        .reduce((sum, debt) => sum + remainingAmount(debt), 0),
      totalIOwe: debts
        .filter((debt) => debt.type === "i_owe_them")
        .reduce((sum, debt) => sum + remainingAmount(debt), 0),
    }),
    [debts],
  );

  const value = useMemo(
    () => ({ debts, loading, addDebt, addPayment, deleteDebt, getDebt, refresh, ...totals }),
    [debts, loading, totals],
  );

  return <DebtContext.Provider value={value}>{children}</DebtContext.Provider>;
}

export function useDebts() {
  const context = useContext(DebtContext);
  if (!context) throw new Error("useDebts must be used inside DebtProvider");
  return context;
}
