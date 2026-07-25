import { useMemo } from "react";

export default function useAdDevPointsStats(
  earned: number,
  spent: number
) {
  const points = useMemo(() => earned - spent, [earned, spent]);

  return {
    points,
    totalEarned: earned,
    totalSpent: spent,
  };
}
