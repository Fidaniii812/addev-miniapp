type Props = {
  onBuy: () => void;
  onSpend: () => void;
};

export default function StarsActions({
  onBuy,
  onSpend,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "20px",
      }}
    >
      <button
        onClick={onBuy}
        style={{
          flex: 1,
          padding: "12px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        ⭐ Buy Stars
      </button>

      <button
        onClick={onSpend}
        style={{
          flex: 1,
          padding: "12px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        💸 Spend Stars
      </button>
    </div>
  );
}
