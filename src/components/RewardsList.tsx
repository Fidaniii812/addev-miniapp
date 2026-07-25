import RewardsCard from "./RewardsCard";
import { Reward } from "../hooks/useRewards";

type Props = {
  rewards: Reward[];
  onClaim: (id: number) => void;
};

export default function RewardsList({
  rewards,
  onClaim,
}: Props) {
  return (
    <>
      {rewards.map((reward) => (
        <RewardsCard
          key={reward.id}
          title={reward.title}
          description={reward.description}
          reward={reward.reward}
          claimed={reward.claimed}
          onClaim={() => onClaim(reward.id)}
        />
      ))}
    </>
  );
}
