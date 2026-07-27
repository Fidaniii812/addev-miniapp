import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [user, setUser] = useState<any>(null);
  const [adcBalance, setAdcBalance] = useState<number>(0);
  const [adsToday, setAdsToday] = useState<number>(0);

  // Mining States
  const [miningLevel, setMiningLevel] = useState<number>(1);
  const [miningRate, setMiningRate] = useState<number>(20);
  const [miningActive, setMiningActive] = useState<boolean>(false);
  const [miningEndTime, setMiningEndTime] = useState<number | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string>("");

  // ⚙️ KONFIGURIMI I LINKEVE
  const BOT_USERNAME = "sddev_rewards_bot";
  const MONETAG_LINK = "https://omg10.com/4/10168362";
  const ADMITAD_AFFILIATE_LINK = "https://tatrck.com/h/0Hu30--d0OU9?model=cpa";
  const MAJOR_TELEGRAM_LINK = "https://t.me/major/start?startapp=8508477699";
  const ADDEV_STUDIO_LINK = "https://addev-studio.com";
  const ADDEV_DEALS_LINK = "https://addev-studio.com/deals";

  useEffect(() => {
    initTelegramUser();
  }, []);

  // Countdown timer për Mining
  useEffect(() => {
    let interval: any = null;
    if (miningActive && miningEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = miningEndTime - now;

        if (diff <= 0) {
          setMiningActive(false);
          setTimeLeftStr("Ready to Claim!");
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

        // Kërko përdoruesin në Supabase
        const { data: existingUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", tgUser.id)
          .maybeSingle();

        if (error) {
          alert("Gabim gjatë leximit nga Supabase: " + error.message);
        }

        if (existingUser) {
          setAdcBalance(existingUser.adc_balance || 0);
          setAdsToday(existingUser.ads_watched_today || 0);
          setMiningLevel(existingUser.mining_level || 1);
          setMiningRate(existingUser.mining_rate || 20);

          if (existingUser.mining_end_time) {
            const end = new Date(existingUser.mining_end_time).getTime();
            setMiningEndTime(end);
            if (end > Date.now()) {
              setMiningActive(true);
            } else {
              setMiningActive(false);
              setTimeLeftStr("Ready to Claim!");
            }
          }
        } else {
          // Krijo përdoruesin me UPSERT nëse nuk ekziston
          const startParam = tg.initDataUnsafe?.start_param;
          const referrerId = startParam ? parseInt(startParam) : null;

          const newUserPayload = {
            telegram_id: tgUser.id,
            username: tgUser.username || "",
            first_name: tgUser.first_name || "User",
            adc_balance: 0,
            ads_watched_today: 0,
            mining_level: 1,
            mining_rate: 20,
            referred_by: referrerId,
          };

          const { data: createdUser, error: upsertError } = await supabase
            .from("users")
            .upsert(newUserPayload, { onConflict: "telegram_id" })
            .select()
            .single();

          if (upsertError) {
            alert("Gabim gjatë krijimit të përdoruesit: " + upsertError.message);
          }

          if (createdUser) {
            setAdcBalance(createdUser.adc_balance || 0);
          }
        }
      }
    }
  };

  // Funksion ndihmës për të ruajtur ndryshimet direkt me Upsert
  const saveUserData = async (updatedFields: Record<string, any>) => {
    if (!user) return;
    const { error } = await supabase.from("users").upsert(
      {
        telegram_id: user.id,
        username: user.username || "",
        first_name: user.first_name || "User",
        ...updatedFields,
      },
      { onConflict: "telegram_id" }
    );

    if (error) {
      alert("Gabim gjatë ruajtjes: " + error.message);
    }
  };

  // Start Mining
  const handleStartMining = async () => {
    const endTime = Date.now() + 24 * 60 * 60 * 1000;
    const endIso = new Date(endTime).toISOString();

    setMiningActive(true);
    setMiningEndTime(endTime);

    await saveUserData({
      adc_balance: adcBalance,
      mining_end_time: endIso,
    });
  };

  // Claim Mining
  const handleClaimMining = async () => {
    const reward = miningRate * 24;
    const newBalance = adcBalance + reward;

    setAdcBalance(newBalance);
    setMiningActive(false);
    setMiningEndTime(null);
    setTimeLeftStr("");

    await saveUserData({
      adc_balance: newBalance,
      mining_end_time: null,
    });

    alert(`🎉 Successfully claimed +${reward} ADC!`);
  };

  // Upgrade Mining
  const handleUpgradeWithStars = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.openInvoice) {
      alert("⭐ Opening Telegram Stars payment...");
    } else {
      setMiningLevel(2);
      setMiningRate(40);
      await saveUserData({
        mining_level: 2,
        mining_rate: 40,
      });
      alert("🚀 Mining upgraded to Level 2 (40 ADC / hr)!");
    }
  };

  // Watch Ad
  const handleWatchAd = async () => {
    if (adsToday >= 20) {
      alert("You have reached the daily limit of 20 ads!");
      return;
    }

    window.open(MONETAG_LINK, "_blank");

    setTimeout(async () => {
      const newBalance = adcBalance + 50;
      const newAds = adsToday + 1;

      setAdcBalance(newBalance);
      setAdsToday(newAds);

      await saveUserData({
        adc_balance: newBalance,
        ads_watched_today: newAds,
      });

      alert("🎉 Earned +50 ADC!");
    }, 2000);
  };

  // Withdraw
  const handleWithdrawRequest = async () => {
    if (!walletAddress || walletAddress.trim().length < 10) {
      alert("Please enter a valid wallet address!");
      return;
    }

    if (adcBalance < 15000) {
      alert("Insufficient balance (Minimum: 15,000 ADC)!");
      return;
    }

    const newBalance = adcBalance - 15000;

    const { error } = await supabase.from("withdrawals").insert([
      {
        telegram_id: user?.id || 0,
        username: user?.username || "User",
        amount: 15000,
        wallet_address: walletAddress,
        status: "pending",
      },
    ]);

    if (!error) {
      setAdcBalance(newBalance);
      await saveUserData({ adc_balance: newBalance });
      alert("✅ Withdrawal request submitted successfully!");
      setWalletAddress("");
    } else {
      alert("Error submitting withdrawal: " + error.message);
    }
  };

  const usdtEquivalent = (adcBalance / 1000).toFixed(2);

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif", paddingBottom: "90px" }}>
      {/* Header */}
      <div style={{ background: "#1e293b", padding: "16px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>{user?.first_name || "User"}</div>
          <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "2px" }}>
            🆔 ID: <span style={{ fontFamily: "monospace" }}>{user?.id || "N/A"}</span>
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
              <div style={{ fontSize: "13px", color: "#e0f2fe" }}>Total Balance</div>
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
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Mining Speed Level {miningLevel}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#38bdf8", margin: "8px 0" }}>
                {miningRate} ADC / hour
              </div>

              <div style={{ background: "#0f172a", padding: "14px", borderRadius: "12px", margin: "16px 0", border: "1px solid #1e293b" }}>
                {miningActive ? (
                  <>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Time Remaining:</div>
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#eab308", marginTop: "4px" }}>{timeLeftStr}</div>
                  </>
                ) : miningEndTime && !miningActive ? (
                  <>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Mining Complete!</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22c55e", marginTop: "4px" }}>+{miningRate * 24} ADC Ready</div>
                  </>
                ) : (
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>Mining is inactive. Click below to start 24 Hours free mining!</div>
                )}
              </div>

              {!miningActive && !miningEndTime && (
                <button onClick={handleStartMining} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #0284c7, #38bdf8)", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
                  ▶ Start Mining (24 Hours Free)
                </button>
              )}

              {miningActive && (
                <button disabled style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#334155", color: "#94a3b8", fontWeight: "bold" }}>
                  ⏳ Mining in Progress...
                </button>
              )}

              {!miningActive && miningEndTime && (
                <button onClick={handleClaimMining} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #16a34a, #22c55e)", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
                  🎉 Claim {miningRate * 24} ADC
                </button>
              )}
            </div>

            {miningLevel < 2 && (
              <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "16px", borderRadius: "16px", border: "1px solid #eab308" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#eab308" }}>⚡ Boost Speed to 40 ADC/hr</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>Double your daily ADC production:</p>
                <button onClick={handleUpgradeWithStars} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #eab308, #ca8a04)", color: "#000", fontWeight: "bold", marginBottom: "10px", cursor: "pointer" }}>
                  ⭐ Upgrade with 50 Telegram Stars
                </button>
                <button onClick={() => setActiveTab("tasks")} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #38bdf8", background: "transparent", color: "#38bdf8", fontWeight: "bold", cursor: "pointer" }}>
                  📋 Complete Tasks to Upgrade (Free)
                </button>
              </div>
            )}
          </div>
        )}

        {/* 📺 ADS */}
        {activeTab === "ads" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📺 Watch & Earn</h2>
            <div style={{ background: "#1e293b", padding: "16px", borderRadius: "16px", border: "1px solid #38bdf8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Watch Video Ad</h3>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>+50 ADC per video</div>
                </div>
                <div style={{ fontWeight: "bold", color: "#22c55e" }}>{adsToday}/20</div>
              </div>
              <button onClick={handleWatchAd} disabled={adsToday >= 20} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: adsToday >= 20 ? "#475569" : "#16a34a", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
                {adsToday >= 20 ? "Daily Limit Reached" : "Watch Ad (+50 ADC)"}
              </button>
            </div>
          </div>
        )}

        {/* 📋 TASKS */}
        {activeTab === "tasks" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📋 Featured Tasks</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Check Special Offers</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>Explore top partner deals (Admitad)</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+500 ADC</div>
                </div>
                <button onClick={() => window.open(ADMITAD_AFFILIATE_LINK, "_blank")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Start</button>
              </div>

              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Join Major App</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>Check out Major Telegram bot</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+500 ADC</div>
                </div>
                <button onClick={() => window.open(MAJOR_TELEGRAM_LINK, "_blank")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Start</button>
              </div>

              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Visit AdDev Studio</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>Discover addev-studio.com</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+300 ADC</div>
                </div>
                <button onClick={() => window.open(ADDEV_STUDIO_LINK, "_blank")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Start</button>
              </div>

              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Explore AdDev Deals</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>Check latest exclusive discounts</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+400 ADC</div>
                </div>
                <button onClick={() => window.open(ADDEV_DEALS_LINK, "_blank")} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Start</button>
              </div>
            </div>
          </div>
        )}

        {/* 👥 INVITE */}
        {activeTab === "invite" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>👥 Invite Friends</h2>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", textAlign: "center", border: "1px solid #334155" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎁</div>
              <h3 style={{ margin: "0 0 8px 0" }}>Earn +1,000 ADC</h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
                Invite your friends and earn 1,000 ADC for each user who joins using your referral link!
              </p>
              <button
                onClick={() => {
                  const refLink = `https://t.me/${BOT_USERNAME}?start=${user?.id || ""}`;
                  navigator.clipboard.writeText(refLink);
                  alert(`Referral link copied: ${refLink}`);
                }}
                style={{ width: "100%", padding: "12px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
              >
                📋 Copy Referral Link
              </button>
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

              <div style={{ marginTop: "16px", textAlign: "left" }}>
                <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Enter Wallet Address (USDT / TON / TRC20):
                </label>
                <input
                  type="text"
                  placeholder="e.g. TX123456789... or EQ..."
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
                {adcBalance >= 15000 ? "Submit Withdrawal Request ($15 USDT)" : `Need ${(15000 - adcBalance).toLocaleString()} more ADC`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
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
