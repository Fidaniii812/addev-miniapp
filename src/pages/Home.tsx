import { useState } from "react";

export default function Home() {
  const [points, setPoints] = useState<number>(1250);
  const [claimedToday, setClaimedToday] = useState<boolean>(false);

  const handleDailyClaim = () => {
    if (claimedToday) return;
    setPoints((prev) => prev + 100);
    setClaimedToday(true);
    alert("Keni marrë +100 PTS për sot!");
  };

  return (
    <div style={{ padding: "16px", color: "#fff", fontFamily: "sans-serif", paddingBottom: "80px" }}>
      {/* Banner Kryesor */}
      <div style={{
        background: "linear-gradient(135deg, #0284c7, #0f172a)",
        padding: "24px 16px",
        borderRadius: "20px",
        textAlign: "center",
        border: "1px solid #38bdf8",
        marginBottom: "20px"
      }}>
        <div style={{ fontSize: "14px", color: "#93c5fd" }}>Mirësevini te AdDev Rewards</div>
        <div style={{ fontSize: "36px", fontWeight: "bold", margin: "10px 0" }}>
          {points.toLocaleString()} <span style={{ fontSize: "20px", color: "#38bdf8" }}>PTS</span>
        </div>
        <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0 }}>
          Kryeni detyra, shikoni reklama dhe fito shpërblime çdo ditë!
        </p>
      </div>

      {/* Daily Check-In */}
      <div style={{
        background: "#1e293b",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #334155",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>🎁 Shpërblimi Ditor</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Hyr çdo ditë për +100 PTS</p>
          </div>
          <button
            onClick={handleDailyClaim}
            disabled={claimedToday}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              background: claimedToday ? "#475569" : "#22c55e",
              color: "#fff",
              fontWeight: "bold",
              cursor: claimedToday ? "not-allowed" : "pointer"
            }}
          >
            {claimedToday ? "E Marre" : "Merr +100"}
          </button>
        </div>
      </div>

      {/* Direct Deal Banner */}
      <div style={{
        background: "#1e293b",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #334155"
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#eab308" }}>🔥 Oferta e Ditës</h3>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
          Regjistrohu në platformën tonë me të re affiliate dhe fito pikë ekstra!
        </p>
        <button
          onClick={() => window.open("https://google.com", "_blank")}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background: "#0284c7",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Shiko Ofertën
        </button>
      </div>
    </div>
  );
}
