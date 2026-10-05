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

export const remainingAmount = (debt: Debt) =>
  Math.max(0, debt.amount - debt.payments.reduce((total, payment) => total + payment.amount, 0));

export const paymentProgress = (debt: Debt) =>
  debt.amount > 0 ? Math.min(1, (debt.amount - remainingAmount(debt)) / debt.amount) : 0;
