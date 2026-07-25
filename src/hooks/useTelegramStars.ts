import { useState } from "react";

export default function useTelegramStars() {
  const [stars, setStars] = useState(0);

  const buyStars = (amount: number) => {
    setStars((current) => current + amount);
  };

  const spendStars = (amount: number) => {
    if (stars >= amount) {
      setStars((current) => current - amount);
    }
  };

  return {
    stars,
    buyStars,
    spendStars,
  };
}
