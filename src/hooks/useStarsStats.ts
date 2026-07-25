import { useMemo } from "react";
import { Transaction } from "./useTelegramTransactions";

export default function useStarsStats(transactions: Transaction[]) {
  const totalBought = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "buy")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalSpent = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "spend")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  return {
    totalBought,
    totalSpent,
  };
}
