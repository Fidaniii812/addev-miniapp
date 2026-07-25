type Props = {
  totalRewards: number;
  claimedRewards: number;
};

export default function RewardsStatsCard({
  totalRewards,
  claimedRewards,
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
      <h2>🎁 Rewards Statistics</h2>

      <p>Total Rewards: {totalRewards}</p>
      <p>Claimed Rewards: {claimedRewards}</p>
    </div>
  );
}
