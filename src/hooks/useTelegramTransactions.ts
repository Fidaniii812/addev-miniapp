import { useState } from "react";

export type Transaction = {
  id: number;
  type: "buy" | "spend";
  amount: number;
  date: string;
};

export default function useTelegramTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (
    type: "buy" | "spend",
    amount: number
  ) => {
    setTransactions((current) => [
      {
        id: Date.now(),
        type,
        amount,
        date: new Date().toLocaleString(),
      },
      ...current,
    ]);
  };

  return {
    transactions,
    addTransaction,
  };
}
