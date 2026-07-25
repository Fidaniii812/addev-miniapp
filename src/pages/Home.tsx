import UserCard from "../components/UserCard";
import TelegramStarsCard from "../components/TelegramStarsCard";
import StarsBalance from "../components/StarsBalance";
import StarsActions from "../components/StarsActions";
import TransactionHistory from "../components/TransactionHistory";
import StarsStats from "../components/StarsStats";
import StarsOverview from "../components/StarsOverview";

import AdDevPointsCard from "../components/AdDevPointsCard";
import AdDevPointsActions from "../components/AdDevPointsActions";
import AdDevPointsStats from "../components/AdDevPointsStats";
import AdDevPointsHistory from "../components/AdDevPointsHistory";

import DailyTasksList from "../components/DailyTasksList";
import DailyRewardsCard from "../components/DailyRewardsCard";

import RewardsList from "../components/RewardsList";
import RewardsStatsCard from "../components/RewardsStatsCard";

import useTelegramUser from "../hooks/useTelegramUser";
import useTelegramStars from "../hooks/useTelegramStars";
import useTelegramTransactions from "../hooks/useTelegramTransactions";
import useStarsStats from "../hooks/useStarsStats";

import useAdDevPoints from "../hooks/useAdDevPoints";
import useAdDevPointsStats from "../hooks/useAdDevPointsStats";
import useAdDevPointsHistory from "../hooks/useAdDevPointsHistory";

import useDailyTasks from "../hooks/useDailyTasks";
import useDailyRewards from "../hooks/useDailyRewards";

import useRewards from "../hooks/useRewards";
import useRewardsStats from "../hooks/useRewardsStats";

export default function Home() {
  const user = useTelegramUser();

  const { stars, buyStars, spendStars } = useTelegramStars();
  const { transactions, addTransaction } = useTelegramTransactions();
  const { totalBought, totalSpent } = useStarsStats(transactions);

  const { points, addPoints, spendPoints } = useAdDevPoints();
  const { history, addHistory } = useAdDevPointsHistory();

  const pointStats = useAdDevPointsStats(
    history.filter(h => h.type === "earn").reduce((s, h) => s + h.amount, 0),
    history.filter(h => h.type === "spend").reduce((s, h) => s + h.amount, 0)
  );

  const { tasks, completeTask } = useDailyTasks();
  const { totalRewards, completedTasks } = useDailyRewards(tasks);

  const { rewards, claimReward } = useRewards();
  const rewardsStats = useRewardsStats(rewards);

  const handleBuy = () => {
    buyStars(10);
    addTransaction("buy", 10);
  };

  const handleSpend = () => {
    spendStars(10);
    addTransaction("spend", 10);
  };

  const handleAddPoints = () => {
    addPoints(100);
    addHistory("earn", 100);
  };

  const handleSpendPoints = () => {
    spendPoints(50);
    addHistory("spend", 50);
  };

  return (
    <div style={{ padding: "20px" }}>
      <UserCard user={user} />

      <TelegramStarsCard stars={stars} onBuy={handleBuy} onSpend={handleSpend} />
      <StarsBalance stars={stars} />
      <StarsActions onBuy={handleBuy} onSpend={handleSpend} />
      <StarsStats stars={stars} totalBought={totalBought} totalSpent={totalSpent} />
      <StarsOverview stars={stars} totalBought={totalBought} totalSpent={totalSpent} />
      <TransactionHistory transactions={transactions} />

      <AdDevPointsCard points={points} />
      <AdDevPointsActions onAdd={handleAddPoints} onSpend={handleSpendPoints} />
      <AdDevPointsStats
        points={pointStats.points}
        totalEarned={pointStats.totalEarned}
        totalSpent={pointStats.totalSpent}
      />
      <AdDevPointsHistory history={history} />

      <DailyRewardsCard
        totalRewards={totalRewards}
        completedTasks={completedTasks}
      />

      <DailyTasksList
        tasks={tasks}
        onComplete={completeTask}
      />

      <RewardsStatsCard
        totalRewards={rewardsStats.totalRewards}
        claimedRewards={rewardsStats.claimedRewards}
      />

      <RewardsList
        rewards={rewards}
        onClaim={claimReward}
      />
    </div>
  );
}
