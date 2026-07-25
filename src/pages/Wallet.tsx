export default function Wallet() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <h2>Wallet</h2>

      <h3>Balance</h3>

      <p>0 ADP</p>

      <button
        style={{
          padding: "12px 24px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Withdraw
      </button>
    </div>
  );
}
