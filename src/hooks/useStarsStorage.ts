import { useEffect } from "react";

export default function useStarsStorage(
  stars: number,
  setStars: (value: number) => void
) {
  useEffect(() => {
    const saved = localStorage.getItem("telegram-stars");

    if (saved) {
      setStars(Number(saved));
    }
  }, [setStars]);

  useEffect(() => {
    localStorage.setItem("telegram-stars", String(stars));
  }, [stars]);
}
