import { useState } from "react";

export type Reward = {
  id: number;
  title: string;
  description: string;
  reward: number;
  claimed: boolean;
};

export default function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      title: "Daily Login",
      description: "Login today",
      reward: 100,
      claimed: false,
    },
    {
      id: 2,
      title: "Invite Friend",
      description: "Invite one friend",
      reward: 250,
      claimed: false,
    },
  ]);

  const claimReward = (id: number) => {
    setRewards((current) =>
      current.map((reward) =>
        reward.id === id
          ? { ...reward, claimed: true }
          : reward
      )
    );
  };

  return {
    rewards,
    claimReward,
  };
}
