import { useState } from "react";

export default function useAdDevPoints() {
  const [points, setPoints] = useState(0);

  const addPoints = (amount: number) => {
    setPoints((current) => current + amount);
  };

  const spendPoints = (amount: number) => {
    setPoints((current) => Math.max(0, current - amount));
  };

  return {
    points,
    addPoints,
    spendPoints,
  };
}
