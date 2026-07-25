type Props = {
  title: string;
  reward: number;
  completed: boolean;
  onComplete: () => void;
};

export default function DailyTaskCard({
  title,
  reward,
  completed,
  onComplete,
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
      <h3>{title}</h3>

      <p>💎 Reward: {reward} ADP</p>

      <button
        onClick={onComplete}
        disabled={completed}
        style={{
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          cursor: completed ? "default" : "pointer",
        }}
      >
        {completed ? "✅ Completed" : "Complete Task"}
      </button>
    </div>
  );
}
