export type DebtType = "they_owe_me" | "i_owe_them";

export type Payment = {
  id: string;
  amount: number;
  date: string;
};

export type Debt = {
  id: string;
  person: string;
  amount: number;
  type: DebtType;
  dueDate: string;
  note: string;
  createdAt: string;
  payments: Payment[];
  reminderId?: string;
};

export const remainingAmount = (debt: Debt) =>
  Math.max(
    0,
    debt.amount - debt.payments.reduce((total, payment) => total + payment.amount, 0),
  );
