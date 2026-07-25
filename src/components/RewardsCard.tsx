type Props = {
  title: string;
  description: string;
  reward: number;
  claimed: boolean;
  onClaim: () => void;
};

export default function RewardsCard({
  title,
  description,
  reward,
  claimed,
  onClaim,
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
      <h2>{title}</h2>

      <p>{description}</p>

      <p>🎁 Reward: {reward} ADP</p>

      <button
        onClick={onClaim}
        disabled={claimed}
        style={{
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
        }}
      >
        {claimed ? "✅ Claimed" : "Claim Reward"}
      </button>
    </div>
  );
}
