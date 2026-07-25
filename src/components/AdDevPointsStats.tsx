type Props = {
  points: number;
  totalEarned: number;
  totalSpent: number;
};

export default function AdDevPointsStats({
  points,
  totalEarned,
  totalSpent,
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
      <h2>💎 AdDev Points Stats</h2>

      <p>Current Points: {points}</p>
      <p>Total Earned: {totalEarned}</p>
      <p>Total Spent: {totalSpent}</p>
    </div>
  );
}
