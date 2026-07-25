type Props = {
  totalRewards: number;
  completedTasks: number;
};

export default function DailyRewardsCard({
  totalRewards,
  completedTasks,
}: Props) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "20px",
      }}
    >
      <h2>🎁 Daily Rewards</h2>

      <p>💎 Rewards Earned: {totalRewards}</p>
      <p>✅ Completed Tasks: {completedTasks}</p>
    </div>
  );
}
