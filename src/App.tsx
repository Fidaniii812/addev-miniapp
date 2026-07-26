import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [user, setUser] = useState<any>(null);
  const [adcBalance, setAdcBalance] = useState<number>(0);
  const [adsToday, setAdsToday] = useState<number>(0);
  
  // Mining States
  const [miningLevel, setMiningLevel] = useState<number>(1);
  const [miningRate, setMiningRate] = useState<number>(20); // 20 ADC/hr fillimisht
  const [lastClaim, setLastClaim] = useState<number>(Date.now());
  const [pendingMining, setPendingMining] = useState<number>(0);

  const MONETAG_LINK = "https://omg10.com/4/10168362";

  useEffect(() => {
    initTelegramUser();
  }, []);

  // Llogaritja e ADC-ve të prodhuara nga Mining çdo sekondë
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const hoursPassed = (now - lastClaim) / (1000 * 60 * 60);
      const earned = Math.floor(hoursPassed * miningRate);
      setPendingMining(earned);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaim, miningRate]);

  const initTelegramUser = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        setUser(tgUser);

        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", tgUser.id)
          .single();

        if (existingUser) {
          setAdcBalance(existingUser.adc_balance || 0);
          setAdsToday(existingUser.ads_watched_today || 0);
          setMiningLevel(existingUser.mining_level || 1);
          setMiningRate(existingUser.mining_level === 2 ? 40 : 20);
          if (existingUser.mining_last_claim) {
            setLastClaim(new Date(existingUser.mining_last_claim).getTime());
          }
        } else {
          const startParam = tg.initDataUnsafe?.start_param;
          const referrerId = startParam ? parseInt(startParam) : null;

          const { data: newUser } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: tgUser.id,
                username: tgUser.username || "",
                first_name: tgUser.first_name || "User",
                adc_balance: 0,
                mining_level: 1,
                mining_rate: 20,
                referred_by: referrerId,
              },
            ])
            .select()
            .single();

          if (newUser) {
            setAdcBalance(newUser.adc_balance);
          }
        }
      }
    }
  };

  // Funksioni për Claim të Mining ADC
  const handleClaimMining = async () => {
    if (pendingMining <= 0) {
      alert("Nuk keni monedha të reja për të mbledhur akoma!");
      return;
    }

    const newBalance = adcBalance + pendingMining;
    const nowIso = new Date().toISOString();

    setAdcBalance(newBalance);
    setLastClaim(Date.now());
    setPendingMining(0);

    if (user) {
      await supabase
        .from("users")
        .update({
          adc_balance: newBalance,
          mining_last_claim: nowIso,
        })
        .eq("telegram_id", user.id);
    }

    alert(`🎉 Mblodhët +${pendingMining} ADC!`);
  };

  // Funksioni për Upgrade me Telegram Stars (50 Stars -> 40 ADC/orë)
  const handleUpgradeWithStars = async () => {
    const tg = (window as any).Telegram?.WebApp;
    
    // Thirrja e API-t të Telegram Stars Invoice
    if (tg && tg.openInvoice) {
      // Këtu integrohet linku i faturës nga Telegram Bot API për Stars
      alert("⭐ Po hapet dritarja e pagesës me Telegram Stars (50 Stars)...");
    } else {
      // Simulin për test
      setMiningLevel(2);
      setMiningRate(40);
      if (user) {
        await supabase
          .from("users")
          .update({ mining_level: 2, mining_rate: 40 })
          .eq("telegram_id", user.id);
      }
      alert("🚀 Mining u rrit në Level 2! Tani fitoni 40 ADC / orë!");
    }
  };

  // Funksioni për Shikimin e Reklamës (+50 ADC)
  const handleWatchAd = async () => {
    if (adsToday >= 20) {
      alert("Keni arritur limitin ditor prej 20 reklamash!");
      return;
    }

    window.open(MONETAG_LINK, "_blank");

    setTimeout(async () => {
      const newBalance = adcBalance + 50;
      const newAdsCount = adsToday + 1;

      setAdcBalance(newBalance);
      setAdsToday(newAdsCount);

      if (user) {
        await supabase
          .from("users")
          .update({
            adc_balance: newBalance,
            ads_watched_today: newAdsCount,
          })
          .eq("telegram_id", user.id);
      }

      alert("🎉 Fitove +50 ADC!");
    }, 2000);
  };

  const usdtEquivalent = (adcBalance / 1000).toFixed(2);

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif", paddingBottom: "90px" }}>
      {/* Header */}
      <div style={{ background: "#1e293b", padding: "16px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>AdDev Rewards v1.0</div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>{user?.first_name || "Përdorues"}</div>
        </div>
        <div style={{ background: "#0f172a", padding: "6px 12px", borderRadius: "20px", border: "1px solid #38bdf8", textAlign: "right" }}>
          <div style={{ color: "#22c55e", fontWeight: "bold", fontSize: "14px" }}>{adcBalance.toLocaleString()} ADC</div>
          <div style={{ fontSize: "10px", color: "#38bdf8" }}>≈ ${usdtEquivalent} USDT</div>
        </div>
      </div>

      {/* Pages Content */}
      <div style={{ padding: "16px" }}>
        {/* 🏠 HOME */}
        {activeTab === "home" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>🏠 Dashboard</h2>
            <div style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)", padding: "20px", borderRadius: "16px", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", color: "#e0f2fe" }}>Bilanci Total</div>
              <div style={{ fontSize: "32px", fontWeight: "bold", margin: "6px 0" }}>${usdtEquivalent} USDT</div>
              <div style={{ fontSize: "12px", color: "#bae6fd" }}>({adcBalance.toLocaleString()} ADC)</div>
            </div>
          </div>
        )}

        {/* ⛏️ MINING */}
        {activeTab === "mining" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>⛏️ Cloud Mining</h2>

            {/* Status Card */}
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Niveli i Mining: Level {miningLevel}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#38bdf8", margin: "8px 0" }}>
                {miningRate} ADC / orë
              </div>

              <div style={{ background: "#0f172a", padding: "12px", borderRadius: "12px", margin: "16px 0", border: "1px solid #1e293b" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Gati për t'u mbledhur:</div>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#22c55e", margin: "4px 0" }}>
                  +{pendingMining} ADC
                </div>
              </div>

              <button
                onClick={handleClaimMining}
                disabled={pendingMining <= 0}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: pendingMining > 0 ? "linear-gradient(90deg, #16a34a, #22c55e)" : "#334155",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: pendingMining > 0 ? "pointer" : "not-allowed"
                }}
              >
                Claim {pendingMining} ADC
              </button>
            </div>

            {/* Upgrade Options Card */}
            {miningLevel < 2 && (
              <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "16px", borderRadius: "16px", border: "1px solid #eab308" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#eab308" }}>⚡ Rrite Miningun në 40 ADC/orë</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                  Zgjidh njërën nga mënyrat për të dyfishuar shpejtësinë e mining:
                </p>

                {/* Option 1: Telegram Stars */}
                <button
                  onClick={handleUpgradeWithStars}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(90deg, #eab308, #ca8a04)",
                    color: "#000",
                    fontWeight: "bold",
                    marginBottom: "10px",
                    cursor: "pointer"
                  }}
                >
                  ⭐ Blej me 50 Telegram Stars
                </button>

                {/* Option 2: Tasks */}
                <button
                  onClick={() => setActiveTab("tasks")}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #38bdf8",
                    background: "transparent",
                    color: "#38bdf8",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  📋 Kryej Detyrat për Upgrade (Falas)
                </button>
              </div>
            )}
          </div>
        )}

        {/* 📺 ADS */}
        {activeTab === "ads" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📺 Monetag Video Ads</h2>
            <div style={{ background: "#1e293b", padding: "16px", borderRadius: "16px", border: "1px solid #38bdf8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Shiko Reklamë</h3>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>+50 ADC për çdo reklamë</div>
                </div>
                <div style={{ fontWeight: "bold", color: "#22c55e" }}>{adsToday}/20</div>
              </div>
              <button onClick={handleWatchAd} disabled={adsToday >= 20} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: adsToday >= 20 ? "#475569" : "#16a34a", color: "#fff", fontWeight: "bold" }}>
                {adsToday >= 20 ? "Limit Ditor U Arrit" : "Shiko Reklamën (+50 ADC)"}
              </button>
            </div>
          </div>
        )}

        {/* 📋 TASKS */}
        {activeTab === "tasks" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📋 Partner Tasks</h2>
            <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>Join Telegram Channel</div>
                <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold" }}>+500 ADC</div>
              </div>
              <button onClick={() => window.open("https://t.me", "_blank")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold" }}>Start</button>
            </div>
          </div>
        )}

        {/* 💰 WALLET */}
        {activeTab === "wallet" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>💰 Wallet & Withdraw</h2>
            <div style={{ background: "#1e293b", padding: "16px", borderRadius: "16px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Minimum Withdrawal</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff", margin: "4px 0" }}>15,000 ADC = $15.00 USDT</div>
              <button disabled={adcBalance < 15000} onClick={() => alert("Kërkesa u dërgua te Admin Panel!")} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: adcBalance >= 15000 ? "#22c55e" : "#334155", color: "#fff", fontWeight: "bold" }}>
                {adcBalance >= 15000 ? "Tërhiq $15.00 USDT" : `Duhen edhe ${(15000 - adcBalance).toLocaleString()} ADC`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f172a", borderTop: "1px solid #334155", display: "flex", justifyContent: "space-around", padding: "10px 0" }}>
        <button onClick={() => setActiveTab("home")} style={{ background: "none", border: "none", color: activeTab === "home" ? "#38bdf8" : "#64748b", fontSize: "12px" }}>🏠<br/>Home</button>
        <button onClick={() => setActiveTab("mining")} style={{ background: "none", border: "none", color: activeTab === "mining" ? "#eab308" : "#64748b", fontSize: "12px" }}>⛏️<br/>Mining</button>
        <button onClick={() => setActiveTab("ads")} style={{ background: "none", border: "none", color: activeTab === "ads" ? "#38bdf8" : "#64748b", fontSize: "12px" }}>📺<br/>Ads</button>
        <button onClick={() => setActiveTab("tasks")} style={{ background: "none", border: "none", color: activeTab === "tasks" ? "#38bdf8" : "#64748b", fontSize: "12px" }}>📋<br/>Tasks</button>
        <button onClick={() => setActiveTab("wallet")} style={{ background: "none", border: "none", color: activeTab === "wallet" ? "#38bdf8" : "#64748b", fontSize: "12px" }}>💰<br/>Wallet</button>
      </div>
    </div>
  );
}
