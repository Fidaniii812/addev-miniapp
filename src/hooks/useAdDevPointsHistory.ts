import { useState } from "react";

export type AdDevHistoryItem = {
  id: number;
  type: "earn" | "spend";
  amount: number;
  date: string;
};

export default function useAdDevPointsHistory() {
  const [history, setHistory] = useState<AdDevHistoryItem[]>([]);

  const addHistory = (
    type: "earn" | "spend",
    amount: number
  ) => {
    setHistory((current) => [
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
    history,
    addHistory,
  };
}
