import { CurrencyCode } from "@/lib/currency";

export type DebtType = "they_owe_me" | "i_owe_them";
export type DebtCategory = "general" | "family" | "food" | "transport" | "work" | "rent" | "other";

export type Payment = { id: string; amount: number; date: string };

export type Debt = {
  id: string;
  person: string;
  amount: number;
  currency: CurrencyCode;
  type: DebtType;
  borrowedDate?: string;
  dueDate?: string;
  note: string;
  category: DebtCategory;
  createdAt: string;
  payments: Payment[];
  reminderId?: string;
};

export const totalPaid = (debt: Debt) => debt.payments.reduce((total, payment) => total + Math.max(0, payment.amount), 0);

export const remainingAmount = (debt: Debt) => Math.max(0, debt.amount - totalPaid(debt));

export const paymentProgress = (debt: Debt) =>
  debt.amount > 0 ? Math.min(1, totalPaid(debt) / debt.amount) : 0;

export const isSettled = (debt: Debt) => remainingAmount(debt) <= 0;

export const currencyTotals = (debts: Debt[], type: DebtType) =>
  debts.filter((debt) => debt.type === type).reduce<Record<CurrencyCode, number>>((totals, debt) => {
    totals[debt.currency] = (totals[debt.currency] ?? 0) + remainingAmount(debt);
    return totals;
  }, {} as Record<CurrencyCode, number>);

export const currencyRecordedTotals = (debts: Debt[]) =>
  debts.reduce<Record<CurrencyCode, number>>((totals, debt) => {
    totals[debt.currency] = (totals[debt.currency] ?? 0) + debt.amount;
    return totals;
  }, {} as Record<CurrencyCode, number>);

export const currencyPaidTotals = (debts: Debt[]) =>
  debts.reduce<Record<CurrencyCode, number>>((totals, debt) => {
    totals[debt.currency] = (totals[debt.currency] ?? 0) + totalPaid(debt);
    return totals;
  }, {} as Record<CurrencyCode, number>);
