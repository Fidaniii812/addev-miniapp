
import { useState, useEffect } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [streakDays, setStreakDays] = useState(3); // Dita e 3-të e check-in

  const user = {
    first_name: "A S",
    id: "8508477699",
    balance: "5.34",
    currency: "TON"
  };

  return (
    <div style={{ background: "#0b132b", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif", paddingBottom: "90px" }}>
      
      {/* 🌟 HEADER / PROFILE CARD */}
      <div style={{ 
        background: "linear-gradient(135deg, #1d4ed8, #1e40af)", 
        padding: "24px 20px", 
        borderBottomLeftRadius: "24px", 
        borderBottomRightRadius: "24px",
        boxShadow: "0 10px 25px rgba(29, 78, 216, 0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ 
            width: "55px", height: "55px", borderRadius: "50%", 
            background: "linear-gradient(135deg, #f59e0b, #d97706)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: "20px", fontWeight: "bold", marginRight: "14px",
            border: "2px solid rgba(255,255,255,0.3)"
          }}>
            {user.first_name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>{user.first_name}</div>
            <div style={{ fontSize: "12px", color: "#93c5fd", marginTop: "2px" }}>
              ID: <span style={{ fontFamily: "monospace" }}>{user.id}</span>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(0, 0, 0, 0.2)", padding: "16px", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
          <div style={{ fontSize: "12px", color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Balance</div>
          <div style={{ fontSize: "32px", fontWeight: "bold", margin: "4px 0", color: "#fff" }}>
            {user.balance} <span style={{ fontSize: "18px", color: "#60a5fa" }}>{user.currency}</span>
          </div>
          <div style={{ fontSize: "11px", color: "#cbd5e1" }}>Available to withdraw</div>
        </div>

        {/* Quick Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "16px" }}>
          <button onClick={() => setActiveTab("ads")} style={{ background: "rgba(255,255,255,0.1)", border: "none", padding: "10px 0", borderRadius: "12px", color: "#fff", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>Ads</button>
          <button onClick={() => setActiveTab("tasks")} style={{ background: "rgba(255,255,255,0.1)", border: "none", padding: "10px 0", borderRadius: "12px", color: "#fff", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>Tasks</button>
          <button onClick={() => setActiveTab("invite")} style={{ background: "rgba(255,255,255,0.1)", border: "none", padding: "10px 0", borderRadius: "12px", color: "#fff", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>Invite</button>
          <button onClick={() => setActiveTab("withdraw")} style={{ background: "rgba(255,255,255,0.1)", border: "none", padding: "10px 0", borderRadius: "12px", color: "#fff", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>Withdraw</button>
        </div>
      </div>

      {/* 📄 CONTENT AREA */}
      <div style={{ padding: "20px" }}>
        
        {/* HOME TAB (Me elemente angazhimi: Daily Check-in & Mini Games) */}
        {activeTab === "home" && (
          <div>
            {/* 🎁 DAILY CHECK-IN BOX (E mban përdoruesin të kthehet çdo ditë) */}
            <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "18px", borderRadius: "20px", border: "1px solid #334155", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "15px" }}>📅 Daily Streak</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Hyni çdo ditë për të fituar më shumë!</div>
                </div>
                <div style={{ background: "#f59e0b", color: "#000", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                  Dita {streakDays} / 7
                </div>
              </div>

              {/* Kutizat e 7 ditëve */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "14px" }}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} style={{ 
                    background: day < streakDays ? "#065f46" : day === streakDays ? "#1d4ed8" : "#1e293b",
                    border: `1px solid ${day === streakDays ? "#60a5fa" : "#334155"}`,
                    borderRadius: "10px", padding: "8px 2px", textAlign: "center", fontSize: "11px"
                  }}>
                    <div style={{ color: "#94a3b8", fontSize: "10px" }}>D{day}</div>
                    <div style={{ fontWeight: "bold", color: day < streakDays ? "#34d399" : "#fff", marginTop: "2px" }}>
                      {day * 0.05}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setClaimedDaily(true)}
                disabled={claimedDaily}
                style={{ 
                  width: "100%", background: claimedDaily ? "#334155" : "linear-gradient(90deg, #10b981, #059669)", 
                  color: claimedDaily ? "#94a3b8" : "#fff", border: "none", padding: "12px", 
                  borderRadius: "12px", fontWeight: "bold", fontSize: "13px", cursor: claimedDaily ? "default" : "pointer" 
                }}
              >
                {claimedDaily ? "✓ Shpërblimi u mor sot"  : "🎁 Merr Shpërblimin Ditor (+0.15 TON)"}
              </button>
            </div>

            {/* 🎡 LUCKY WHEEL PROMPT (Për të krijuar argëtim shtesë) */}
            <div style={{ background: "linear-gradient(135deg, #312e81, #1e1b4b)", padding: "18px", borderRadius: "20px", border: "1px solid #4338ca", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>🎡</div>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>Rrota e Fatit</div>
                <div style={{ fontSize: "12px", color: "#c7d2fe" }}>Rrotullo dhe fito deri në 1.00 TON</div>
              </div>
              <button style={{ background: "#f59e0b", color: "#000", border: "none", padding: "10px 16px", borderRadius: "12px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>
                Luaj Tani
              </button>
            </div>
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === "ads" && (
          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>📺 Watch & Earn</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div style={{ background: "#1e293b", padding: "16px", borderRadius: "16px", border: "1px solid #334155" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>TOTAL WATCHED</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fff", marginTop: "4px" }}>79</div>
              </div>
              <div style={{ background: "#1e293b", padding: "16px", borderRadius: "16px", border: "1px solid #334155" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>TOTAL EARNED</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#34d399", marginTop: "4px" }}>4.74 TON</div>
              </div>
            </div>

            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "20px", border: "1px solid #334155" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ background: "#3b82f6", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginRight: "14px" }}>▶</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: "15px" }}>Watch Ad</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Complete video to earn instantly</div>
                </div>
                <div style={{ background: "#065f46", color: "#34d399", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                  +0.06 TON
                </div>
              </div>
              <div style={{ background: "#0f172a", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "10px" }}>
                <div style={{ background: "#34d399", width: "75%", height: "100%" }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8" }}>
                <span>Ready to earn</span>
                <span>15 / 20 today</span>
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>📋 Partner Tasks</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Beast Hack", "Money Plus", "TonWave Channel", "Free Premium"].map((task, idx) => (
                <div key={idx} style={{ background: "#1e293b", padding: "16px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #334155" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>{task}</div>
                    <div style={{ color: "#34d399", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+0.1 TON</div>
                  </div>
                  <button style={{ background: "#065f46", color: "#34d399", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", fontSize: "12px" }}>
                    ✓ Done
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INVITE TAB */}
        {activeTab === "invite" && (
          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>👥 Invite & Earn</h3>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "20px", border: "1px solid #334155", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌊</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b", marginBottom: "6px" }}>0.40 TON</div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
                Share your unique link and earn 0.40 TON per friend who joins!
              </p>
              <button style={{ width: "100%", background: "linear-gradient(90deg, #f59e0b, #d97706)", color: "#000", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
                🚀 Share with Friends
              </button>
            </div>
          </div>
        )}

        {/* WITHDRAW TAB */}
        {activeTab === "withdraw" && (
          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>💰 Withdraw Funds</h3>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "20px", border: "1px solid #334155" }}>
              <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "12px", borderRadius: "12px", fontSize: "12px", color: "#fcd34d", marginBottom: "16px" }}>
                ⚠️ Minimum 5.70 TON required to withdraw
              </div>
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>AMOUNT</label>
              <input type="text" placeholder="e.g. 10.00" style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "#0f172a", border: "1px solid #334155", color: "#fff", marginBottom: "14px", boxSizing: "border-box" }} />
              
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>WALLET ADDRESS</label>
              <input type="text" placeholder="UQ...abc" style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "#0f172a", border: "1px solid #334155", color: "#fff", marginBottom: "16px", boxSizing: "border-box" }} />
              
              <button style={{ width: "100%", background: "#3b82f6", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>
                🚀 Submit Withdrawal Request
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 🧭 BOTTOM NAVIGATION BAR */}
      <div style={{ 
        position: "fixed", bottom: 0, left: 0, right: 0, 
        background: "#0f172a", borderTop: "1px solid #1e293b", 
        display: "flex", justifyContent: "space-around", padding: "10px 0", 
        zIndex: 100, backdropFilter: "blur(10px)"
      }}>
        <button onClick={() => setActiveTab("home")} style={{ background: "none", border: "none", color: activeTab === "home" ? "#3b82f6" : "#64748b", fontSize: "11px", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>🏠</div>Home
        </button>
        <button onClick={() => setActiveTab("ads")} style={{ background: "none", border: "none", color: activeTab === "ads" ? "#f59e0b" : "#64748b", fontSize: "11px", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>▶</div>Ads
        </button>
        <button onClick={() => setActiveTab("tasks")} style={{ background: "none", border: "none", color: activeTab === "tasks" ? "#34d399" : "#64748b", fontSize: "11px", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>☑</div>Tasks
        </button>
        <button onClick={() => setActiveTab("invite")} style={{ background: "none", border: "none", color: activeTab === "invite" ? "#60a5fa" : "#64748b", fontSize: "11px", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>👥</div>Invite
        </button>
        <button onClick={() => setActiveTab("withdraw")} style={{ background: "none", border: "none", color: activeTab === "withdraw" ? "#f43f5e" : "#64748b", fontSize: "11px", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: "18px" }}>💰</div>Withdraw
        </button>
      </div>

    </div>
  );
}
