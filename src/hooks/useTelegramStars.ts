import { useState } from "react";

export default function useTelegramStars() {
  const [stars, setStars] = useState(0);

  const addStars = (amount: number) => {
    setStars((current) => current + amount);
  };

  const spendStars = (amount: number) => {
    setStars((current) => Math.max(0, current - amount));
  };

  return {
    stars,
    addStars,
    spendStars,
  };
}
