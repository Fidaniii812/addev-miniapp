import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [user, setUser] = useState<any>(null);
  const [adcBalance, setAdcBalance] = useState<number>(0);
  const [adsToday, setAdsToday] = useState<number>(0);
  
  // Mining States
  const [miningLevel, setMiningLevel] = useState<number>(1);
  const [miningRate, setMiningRate] = useState<number>(20); // 20 ADC/hr
  const [miningActive, setMiningActive] = useState<boolean>(false);
  const [miningEndTime, setMiningEndTime] = useState<number | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string>("");

  // LINKS
  const MONETAG_LINK = "https://omg10.com/4/10168362";
  const BOT_USERNAME = "your_bot_username";

  useEffect(() => {
    initTelegramUser();
  }, []);

  // Timer i Mining 24 Orësh
  useEffect(() => {
    let interval: any = null;
    if (miningActive && miningEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = miningEndTime - now;

        if (diff <= 0) {
          setMiningActive(false);
          setTimeLeftStr("Gati për Claim!");
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeftStr(`${hours}h ${mins}m ${secs}s`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [miningActive, miningEndTime]);

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

          if (existingUser.mining_end_time) {
            const end = new Date(existingUser.mining_end_time).getTime();
            if (end > Date.now()) {
              setMiningActive(true);
              setMiningEndTime(end);
            }
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

  // Nisfja e Mining Falas (24 Orë)
  const handleStartMining = async () => {
    const endTime = Date.now() + 24 * 60 * 60 * 1000; // 24 orë në ms
    const endIso = new Date(endTime).toISOString();

    setMiningActive(true);
    setMiningEndTime(endTime);

    if (user) {
      await supabase
        .from("users")
        .update({ mining_end_time: endIso })
        .eq("telegram_id", user.id);
    }
  };

  // Claim i Minimit pas 24 orëve (Rate * 24 orë)
  const handleClaimMining = async () => {
    const reward = miningRate * 24; // 20 * 24 = 480 ADC (ose 960 për Lvl 2)
    const newBalance = adcBalance + reward;

    setAdcBalance(newBalance);
    setMiningActive(false);
    setMiningEndTime(null);
    setTimeLeftStr("");

    if (user) {
      await supabase
        .from("users")
        .update({
          adc_balance: newBalance,
          mining_end_time: null,
        })
        .eq("telegram_id", user.id);
    }

    alert(`🎉 Mblodhët +${reward} ADC! Mund ta nisni përsëri sessions-in e mining.`);
  };

  // Upgrade me Telegram Stars
  const handleUpgradeWithStars = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.openInvoice) {
      alert("⭐ Po hapet dritarja e pagesës me Telegram Stars...");
    } else {
      setMiningLevel(2);
      setMiningRate(40);
      if (user) {
        await supabase
          .from("users")
          .update({ mining_level: 2, mining_rate: 40 })
          .eq("telegram_id", user.id);
      }
      alert("🚀 Mining u rrit në Level 2 (40 ADC / orë)!");
    }
  };

  // Shiko Reklamë (+50 ADC)
  const handleWatchAd = async () => {
    if (adsToday >= 20) {
      alert("Keni arritur limitin ditor prej 20 reklamash!");
      return;
    }

    window.open(MONETAG_LINK, "_blank");

    setTimeout(async () => {
      const newBalance = adcBalance + 50;
      const newAds = adsToday + 1;

      setAdcBalance(newBalance);
      setAdsToday(newAds);

      if (user) {
        await supabase
          .from("users")
          .update({
            adc_balance: newBalance,
            ads_watched_today: newAds,
          })
          .eq("telegram_id", user.id);
      }

      alert("🎉 Fitove +50 ADC!");
    }, 2000);
  };

  // Kërkesa për Tërheqje (Withdraw)
  const handleWithdrawRequest = async () => {
    if (!walletAddress || walletAddress.trim().length < 10) {
      alert("Ju lutem vendosni një adresë të vlefshme kuateli (Wallet Address)!");
      return;
    }

    if (adcBalance < 15000) {
      alert("Nuk keni bilanc të mjaftueshëm për tërheqje (Min: 15,000 ADC)!");
      return;
    }

    const newBalance = adcBalance - 15000;

    // Ruajtja te tabela 'withdrawals' në Supabase
    const { error } = await supabase.from("withdrawals").insert([
      {
        telegram_id: user?.id || 0,
        username: user?.username || "Përdorues",
        amount: 15000,
        wallet_address: walletAddress,
        status: "pending",
      },
    ]);

    if (!error) {
      setAdcBalance(newBalance);
      if (user) {
        await supabase
          .from("users")
          .update({ adc_balance: newBalance })
          .eq("telegram_id", user.id);
      }
      alert("✅ Kërkesa për tërheqje prej $15.00 USDT u dërgua me sukses!");
      setWalletAddress("");
    } else {
      alert("Pasi ndodhi një gabim, ju lutem provoni përsëri.");
    }
  };

  const usdtEquivalent = (adcBalance / 1000).toFixed(2);

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif", paddingBottom: "90px" }}>
      {/* Header me ID e Lojtarit */}
      <div style={{ background: "#1e293b", padding: "16px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>{user?.first_name || "Përdorues"}</div>
          <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "2px" }}>
            🆔 ID: <span style={{ fontFamily: "monospace" }}>{user?.id || "123456789"}</span>
          </div>
        </div>
        <div style={{ background: "#0f172a", padding: "6px 12px", borderRadius: "20px", border: "1px solid #38bdf8", textAlign: "right" }}>
          <div style={{ color: "#22c55e", fontWeight: "bold", fontSize: "14px" }}>{adcBalance.toLocaleString()} ADC</div>
          <div style={{ fontSize: "10px", color: "#38bdf8" }}>≈ ${usdtEquivalent} USDT</div>
        </div>
      </div>

      {/* Main Container */}
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
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Niveli i Mining: Level {miningLevel}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#38bdf8", margin: "8px 0" }}>
                {miningRate} ADC / orë
              </div>

              {/* Status Box */}
              <div style={{ background: "#0f172a", padding: "14px", borderRadius: "12px", margin: "16px 0", border: "1px solid #1e293b" }}>
                {miningActive ? (
                  <>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Koha e mbetur e Mining:</div>
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#eab308", marginTop: "4px" }}>{timeLeftStr}</div>
                  </>
                ) : miningEndTime && !miningActive ? (
                  <>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Mining përfundoi!</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22c55e", marginTop: "4px" }}>+{miningRate * 24} ADC Gati</div>
                  </>
                ) : (
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>Miningu nuk është aktiv. Kliko më poshtë për ta nisur 24 Orë Falas!</div>
                )}
              </div>

              {/* Action Button */}
              {!miningActive && !miningEndTime && (
                <button
                  onClick={handleStartMining}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #0284c7, #38bdf8)", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
                >
                  ▶ Fillo Mining (24 Orë Falas)
                </button>
              )}

              {miningActive && (
                <button disabled style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#334155", color: "#94a3b8", fontWeight: "bold" }}>
                  ⏳ Mining në proces...
                </button>
              )}

              {!miningActive && miningEndTime && (
                <button
                  onClick={handleClaimMining}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #16a34a, #22c55e)", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
                >
                  🎉 Claim {miningRate * 24} ADC
                </button>
              )}
            </div>

            {/* Upgrade Options */}
            {miningLevel < 2 && (
              <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "16px", borderRadius: "16px", border: "1px solid #eab308" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#eab308" }}>⚡ Rrite Miningun në 40 ADC/orë</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>Dyfisho prodhimin ditor të ADC-ve:</p>

                <button
                  onClick={handleUpgradeWithStars}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #eab308, #ca8a04)", color: "#000", fontWeight: "bold", marginBottom: "10px", cursor: "pointer" }}
                >
                  ⭐ Blej me 50 Telegram Stars
                </button>

                <button
                  onClick={() => setActiveTab("tasks")}
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #38bdf8", background: "transparent", color: "#38bdf8", fontWeight: "bold", cursor: "pointer" }}
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
              <button onClick={handleWatchAd} disabled={adsToday >= 20} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: adsToday >= 20 ? "#475569" : "#16a34a", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
                {adsToday >= 20 ? "Limit Ditor U Arrit" : "Shiko Reklamën (+50 ADC)"}
              </button>
            </div>
          </div>
        )}

        {/* 📋 TASKS (Më shumë detyra) */}
        {activeTab === "tasks" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📋 Partner Tasks</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Task 1 */}
              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Join Telegram Channel</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold" }}>+500 ADC</div>
                </div>
                <button onClick={() => window.open("https://t.me", "_blank")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Start</button>
              </div>

              {/* Task 2 */}
              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Subscribe on YouTube</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold" }}>+300 ADC</div>
                </div>
                <button onClick={() => window.open("https://youtube.com", "_blank")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Start</button>
              </div>

              {/* Task 3 */}
              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Follow on X (Twitter)</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold" }}>+200 ADC</div>
                </div>
                <button onClick={() => window.open("https://x.com", "_blank")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Start</button>
              </div>
            </div>
          </div>
        )}

        {/* 👥 INVITE */}
        {activeTab === "invite" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>👥 Fto Miqtë</h2>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", textAlign: "center", border: "1px solid #334155" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎁</div>
              <h3 style={{ margin: "0 0 8px 0" }}>Fitoni +1,000 ADC</h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
                Ftoni miqtë tuaj dhe fitoni 1,000 ADC për çdo përdorues që regjistrohet me linkun tuaj!
              </p>
              <button
                onClick={() => {
                  const refLink = `https://t.me/${BOT_USERNAME}?start=${user?.id || ""}`;
                  navigator.clipboard.writeText(refLink);
                  alert("Linku i ftesës u kopjua me sukses!");
                }}
                style={{ width: "100%", padding: "12px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
              >
                📋 Kopjo Linkun e Ftesës
              </button>
            </div>
          </div>
        )}

        {/* 💰 WALLET & WITHDRAWAL FORM */}
        {activeTab === "wallet" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>💰 Wallet & Withdraw</h2>
            <div style={{ background: "#1e293b", padding: "16px", borderRadius: "16px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Minimum Withdrawal</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff", margin: "4px 0" }}>15,000 ADC = $15.00 USDT</div>

              <div style={{ marginTop: "16px", textAlign: "left" }}>
                <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Vendos Adresën e Portofolit (USDT / TON / TRC20):
                </label>
                <input
                  type="text"
                  placeholder="e.g. TX123456789... ose EQ..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #334155",
                    background: "#0f172a",
                    color: "#fff",
                    marginBottom: "12px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <button
                onClick={handleWithdrawRequest}
                disabled={adcBalance < 15000}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: adcBalance >= 15000 ? "linear-gradient(90deg, #16a34a, #22c55e)" : "#334155",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: adcBalance >= 15000 ? "pointer" : "not-allowed"
                }}
              >
                {adcBalance >= 15000 ? "Dërgo Kërkesën për Tërheqje ($15 USDT)" : `Duhen edhe ${(15000 - adcBalance).toLocaleString()} ADC`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f172a", borderTop: "1px solid #334155", display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 100 }}>
        <button onClick={() => setActiveTab("home")} style={{ background: "none", border: "none", color: activeTab === "home" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>🏠<br/>Home</button>
        <button onClick={() => setActiveTab("mining")} style={{ background: "none", border: "none", color: activeTab === "mining" ? "#eab308" : "#64748b", fontSize: "11px", cursor: "pointer" }}>⛏️<br/>Mining</button>
        <button onClick={() => setActiveTab("ads")} style={{ background: "none", border: "none", color: activeTab === "ads" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>📺<br/>Ads</button>
        <button onClick={() => setActiveTab("tasks")} style={{ background: "none", border: "none", color: activeTab === "tasks" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>📋<br/>Tasks</button>
        <button onClick={() => setActiveTab("invite")} style={{ background: "none", border: "none", color: activeTab === "invite" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>👥<br/>Invite</button>
        <button onClick={() => setActiveTab("wallet")} style={{ background: "none", border: "none", color: activeTab === "wallet" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>💰<br/>Wallet</button>
      </div>
    </div>
  );
}
