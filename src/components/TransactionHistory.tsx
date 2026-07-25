import { Transaction } from "../hooks/useTelegramTransactions";

type Props = {
  transactions: Transaction[];
};

export default function TransactionHistory({ transactions }: Props) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "20px",
      }}
    >
      <h2>📜 Transaction History</h2>

      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        transactions.map((tx) => (
          <div
            key={tx.id}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid #334155",
            }}
          >
            <strong>{tx.type.toUpperCase()}</strong> ⭐ {tx.amount}
            <br />
            <small>{tx.date}</small>
          </div>
        ))
      )}
    </div>
  );
}
