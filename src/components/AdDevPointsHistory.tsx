type HistoryItem = {
  id: number;
  type: "earn" | "spend";
  amount: number;
  date: string;
};

type Props = {
  history: HistoryItem[];
};

export default function AdDevPointsHistory({ history }: Props) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "20px",
      }}
    >
      <h2>📜 AdDev Points History</h2>

      {history.length === 0 ? (
        <p>No history yet.</p>
      ) : (
        history.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid #334155",
            }}
          >
            <strong>{item.type.toUpperCase()}</strong> • {item.amount} ADP
            <br />
            <small>{item.date}</small>
          </div>
        ))
      )}
    </div>
  );
}
