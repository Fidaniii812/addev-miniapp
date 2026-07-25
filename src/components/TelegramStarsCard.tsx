type TelegramStarsCardProps = {
  stars: number;
};

export default function TelegramStarsCard({
  stars,
}: TelegramStarsCardProps) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "20px",
      }}
    >
      <h2>⭐ Telegram Stars</h2>

      <h1>{stars}</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <button
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Buy Stars
        </button>

        <button
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Spend Stars
        </button>
      </div>
    </div>
  );
}
