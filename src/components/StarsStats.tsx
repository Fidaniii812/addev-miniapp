type Props = {
  stars: number;
  totalBought: number;
  totalSpent: number;
};

export default function StarsStats({
  stars,
  totalBought,
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
      <h2>📊 Stars Statistics</h2>

      <p>⭐ Current Balance: {stars}</p>
      <p>🟢 Total Bought: {totalBought}</p>
      <p>🔴 Total Spent: {totalSpent}</p>
    </div>
  );
}
