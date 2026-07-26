import { useState, useEffect } from "react";
import { getTelegramWebApp } from "../lib/telegram";

export default function Home() {
  const [user, setUser] = useState<{ first_name?: string; username?: string; id?: number } | null>(null);
  const [points, setPoints] = useState<number>(1250);
  const [stars, setStars] = useState<number>(0);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
  }, []);

  return (
    <div style={{ padding: "16px", color: "#fff", fontFamily: "sans-serif", paddingBottom: "80px" }}>
      
      {/* Profile Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "50%", 
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontWeight: "bold",
          fontSize: "20px" 
        }}>
          {user?.first_name ? user.first_name[0] : "U"}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px" }}>
            {user?.first_name ? user.first_name : "Telegram User"}
          </h3>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            {user?.username ? `@${user.username}` : user?.id ? `ID: ${user.id}` : "AdDev Member"}
          </span>
        </div>
      </div>

      {/* Main Balance Card (Hero Section) */}
      <div style={{ 
        background: "linear-gradient(135deg, #1e293b, #0f172a)", 
        padding: "24px", 
        borderRadius: "20px", 
        textAlign: "center", 
        border: "1px solid #334155",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        marginBottom: "20px" 
      }}>
        <span style={{ fontSize: "13px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
          Total Balance
        </span>
        <h1 style={{ fontSize: "40px", margin: "8px 0", color: "#38bdf8", fontWeight: "800" }}>
          {points.toLocaleString()} <span style={{ fontSize: "20px" }}>PTS</span>
        </h1>

        <div style={{ display: "flex", justifyContext: "center", gap: "10px", marginTop: "16px" }}>
          <div style={{ flex: 1, background: "#1e293b", padding: "10px", borderRadius: "12px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Stars Balance</span>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#eab308", marginTop: "4px" }}>
              ⭐ {stars} Stars
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Boost section */}
      <div style={{ 
        background: "#1e293b", 
        padding: "16px", 
        borderRadius: "16px", 
        border: "1px solid #334155",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "15px" }}>⭐ VIP Boost 2X</h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Dyfisho pikët për çdo detyrë</p>
          </div>
          <button style={{ 
            background: "#eab308", 
            color: "#000", 
            border: "none", 
            padding: "8px 16px", 
            borderRadius: "10px", 
            fontWeight: "bold",
            cursor: "pointer" 
          }}>
            15 Stars
          </button>
        </div>
      </div>

      {/* Daily Reward Banner */}
      <div style={{ 
        background: "linear-gradient(90deg, #2563eb, #1d4ed8)", 
        padding: "16px", 
        borderRadius: "16px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div>
          <h4 style={{ margin: "0 0 4px 0", fontSize: "15px" }}>Daily Check-In</h4>
          <p style={{ margin: 0, fontSize: "12px", color: "#bfdbfe" }}>Marr +50 PTS çdo ditë</p>
        </div>
        <button style={{ 
          background: "#fff", 
          color: "#1d4ed8", 
          border: "none", 
          padding: "8px 16px", 
          borderRadius: "10px", 
          fontWeight: "bold",
          cursor: "pointer" 
        }}>
          Claim
        </button>
      </div>

    </div>
  );
}
