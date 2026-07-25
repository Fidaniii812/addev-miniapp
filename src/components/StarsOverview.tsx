type Props = {
  stars: number;
  totalBought: number;
  totalSpent: number;
};

export default function StarsOverview({
  stars,
  totalBought,
  totalSpent,
}: Props) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        padding: "20px",
        marginTop: "20px",
      }}
    >
      <h2>⭐ Stars Overview</h2>

      <p>⭐ Balance: {stars}</p>
      <p>🟢 Bought: {totalBought}</p>
      <p>🔴 Spent: {totalSpent}</p>

      <progress
        value={totalSpent}
        max={Math.max(totalBought, 1)}
        style={{ width: "100%" }}
      />
    </div>
  );
}
