import { useState } from "react";

export default function Wallet() {
  const [points] = useState<number>(1250); // Shembull balanca
  const minPointsToWithdraw = 15000; // E barabartë me $15

  return (
    <div style={{ padding: "16px", color: "#fff", fontFamily: "sans-serif", paddingBottom: "80px" }}>
      <h2 style={{ marginBottom: "16px", fontSize: "20px" }}>Portofoli im</h2>

      {/* Card e Balancës */}
      <div style={{
        background: "linear-gradient(135deg, #0284c7, #0f172a)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #38bdf8",
        marginBottom: "20px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "14px", color: "#93c5fd" }}>Balanca e Pikëve</div>
        <div style={{ fontSize: "32px", fontWeight: "bold", margin: "8px 0" }}>
          {points.toLocaleString()} PTS
        </div>
        <div style={{ fontSize: "13px", color: "#e2e8f0" }}>
          Vlera e përafërt: ~${((points / 15000) * 15).toFixed(2)} USD
        </div>
      </div>

      {/* Kushtet e Tërheqjes */}
      <div style={{
        background: "#1e293b",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #334155"
      }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>💸 Tërheqja e Parave (Withdraw)</h3>
        <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>
          Minimumi për tërheqje është <strong>15,000 PTS ($15)</strong>. 
          Vazhdo të kryesh detyra dhe të shikosh reklama çdo ditë për të arritur pragun!
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
          {points >= minPointsToWithdraw ? "Kërko Tërheqjen ($15)" : "Kërkohen edhe " + (minPointsToWithdraw - points) + " PTS"}
        </button>
      </div>
    </div>
  );
}
