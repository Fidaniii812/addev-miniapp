type Props = {
  onAdd: () => void;
  onSpend: () => void;
};

export default function AdDevPointsActions({
  onAdd,
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
        onClick={onAdd}
        style={{
          flex: 1,
          padding: "12px",
          borderRadius: "10px",
          border: "none",
        }}
      >
        ➕ Add Points
      </button>

      <button
        onClick={onSpend}
        style={{
          flex: 1,
          padding: "12px",
          borderRadius: "10px",
          border: "none",
        }}
      >
        ➖ Spend Points
      </button>
    </div>
  );
}
