import UserCard from "../components/UserCard";
import AdDevPointsCard from "../components/AdDevPointsCard";
import RewardsList from "../components/RewardsList";
import RewardsStatsCard from "../components/RewardsStatsCard";

import useTelegramUser from "../hooks/useTelegramUser";
import useAdDevPoints from "../hooks/useAdDevPoints";
import useRewards from "../hooks/useRewards";
import useRewardsStats from "../hooks/useRewardsStats";

export default function ProfilePage() {
  const user = useTelegramUser();

  const { points } = useAdDevPoints();

  const { rewards, claimReward } = useRewards();

  const stats = useRewardsStats(rewards);

  return (
    <div style={{ padding: "20px" }}>
      <UserCard user={user} />

      <AdDevPointsCard points={points} />

      <RewardsStatsCard
        totalRewards={stats.totalRewards}
        claimedRewards={stats.claimedRewards}
      />

      <RewardsList
        rewards={rewards}
        onClaim={claimReward}
      />
    </div>
  );
}
