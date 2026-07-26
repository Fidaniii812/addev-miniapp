import { useState } from "react";

export default function Wallet() {
  const [points] = useState<number>(1250);
  const minPointsToWithdraw = 15000; // Equivalent to $15 USD

  return (
    <div style={{ padding: "16px", color: "#fff", paddingBottom: "80px" }}>
      <h2 style={{ marginBottom: "16px", fontSize: "20px" }}>Your Wallet</h2>

      {/* Balance Card */}
      <div style={{
        background: "linear-gradient(135deg, #0284c7, #0f172a)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #38bdf8",
        marginBottom: "20px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "14px", color: "#93c5fd" }}>Total Balance</div>
        <div style={{ fontSize: "32px", fontWeight: "bold", margin: "8px 0" }}>
          {points.toLocaleString()} PTS
        </div>
        <div style={{ fontSize: "13px", color: "#e2e8f0" }}>
          Estimated Value: ~${((points / 15000) * 15).toFixed(2)} USD
        </div>
      </div>

      {/* Withdrawal Box */}
      <div style={{
        background: "#1e293b",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #334155"
      }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>💸 Payout Threshold</h3>
        <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>
          Minimum withdrawal amount is <strong>15,000 PTS ($15.00)</strong>. 
          Complete tasks and watch ads daily to reach the payout goal!
        </p>

        {/* Progress Bar */}
        <div style={{ background: "#334155", height: "10px", borderRadius: "5px", margin: "16px 0" }}>
          <div style={{
            background: "#22c55e",
            height: "100%",
            borderRadius: "5px",
            width: `${Math.min((points / minPointsToWithdraw) * 100, 100)}%`
          }} />
        </div>

        <button
          disabled={points < minPointsToWithdraw}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: points >= minPointsToWithdraw ? "#22c55e" : "#475569",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: points >= minPointsToWithdraw ? "pointer" : "not-allowed"
          }}
        >
          {points >= minPointsToWithdraw ? "Request Payout ($15)" : `Need ${minPointsToWithdraw - points} PTS More`}
        </button>
      </div>
    </div>
  );
}
