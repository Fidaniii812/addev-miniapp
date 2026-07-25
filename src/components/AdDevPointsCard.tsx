type Props = {
  points: number;
};

export default function AdDevPointsCard({ points }: Props) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "20px",
      }}
    >
      <h2>💎 AdDev Points</h2>

      <h1>{points}</h1>
    </div>
  );
}
