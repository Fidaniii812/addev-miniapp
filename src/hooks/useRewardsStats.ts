import { useMemo } from "react";
import { Reward } from "./useRewards";

export default function useRewardsStats(rewards: Reward[]) {
  const totalRewards = useMemo(
    () => rewards.reduce((sum, reward) => sum + reward.reward, 0),
    [rewards]
  );

  const claimedRewards = useMemo(
    () => rewards.filter((reward) => reward.claimed).length,
    [rewards]
  );

  return {
    totalRewards,
    claimedRewards,
  };
}
