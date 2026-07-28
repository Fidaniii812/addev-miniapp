import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [user, setUser] = useState<any>(null);
  const [adcBalance, setAdcBalance] = useState<number>(0);
  const [adsToday, setAdsToday] = useState<number>(0);

  // Mining States
  const [miningLevel, setMiningLevel] = useState<number>(1);
  const [miningRate, setMiningRate] = useState<number>(5);
  const [miningActive, setMiningActive] = useState<boolean>(false);
  const [miningStartTime, setMiningStartTime] = useState<number | null>(null);
  const [miningEndTime, setMiningEndTime] = useState<number | null>(null);
  const [currentMined, setCurrentMined] = useState<number>(0);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  // Wheel of Fortune States
  const [wheelSpinsToday, setWheelSpinsToday] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  // Tasks verification states
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [taskLoading, setTaskLoading] = useState<string | null>(null);

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string>("");

  // ⚙️ LINKS & BOT CONFIGURATION
  const BOT_USERNAME = "addev_rewards_bot";
  const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN || "";

  const MONETAG_LINK = "https://omg10.com/4/10168362";
  const MAJOR_TELEGRAM_LINK = "https://t.me/major/start?startapp=8508477699";
  const ADDEV_STUDIO_LINK = "https://addev-studio.com";
  const ADDEV_MINIAPP_LINK = "https://addev-miniapp.vercel.app/";

  useEffect(() => {
    initTelegramUser();
  }, []);

  // Live Mining & Countdown timer logic
  useEffect(() => {
    let interval: any = null;
    if (miningActive && miningEndTime && miningStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = miningEndTime - now;

        const elapsedHours = (now - miningStartTime) / (1000 * 60 * 60);
        const maxMined = miningRate * 24;
        const minedSoFar = Math.min(elapsedHours * miningRate, maxMined);
        setCurrentMined(minedSoFar);

        if (diff <= 0) {
          setMiningActive(false);
          setCurrentMined(maxMined);
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
  }, [miningActive, miningEndTime, miningStartTime, miningRate]);

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
          .maybeSingle();

        if (existingUser) {
          setAdcBalance(existingUser.adc_balance || 0);
          setAdsToday(existingUser.ads_watched_today || 0);
          setMiningLevel(existingUser.mining_level || 1);
          setMiningRate(existingUser.mining_rate || 5);
          setWheelSpinsToday(existingUser.wheel_spins_today || 0);
          
          if (existingUser.completed_tasks && Array.isArray(existingUser.completed_tasks)) {
            setCompletedTasks(existingUser.completed_tasks);
          }

          if (existingUser.mining_end_time && existingUser.mining_start_time) {
            const start = new Date(existingUser.mining_start_time).getTime();
            const end = new Date(existingUser.mining_end_time).getTime();
            setMiningStartTime(start);
            setMiningEndTime(end);

            const now = Date.now();
            const maxMined = (existingUser.mining_rate || 5) * 24;

            if (end > now) {
              setMiningActive(true);
              const elapsedHours = (now - start) / (1000 * 60 * 60);
              setCurrentMined(Math.min(elapsedHours * (existingUser.mining_rate || 5), maxMined));
            } else {
              setMiningActive(false);
              setCurrentMined(maxMined);
              setTimeLeftStr("Ready to Claim!");
            }
          }
        } else {
          const startParam = tg.initDataUnsafe?.start_param;
          const referrerId = startParam ? parseInt(startParam) : null;

          const newUserPayload = {
            telegram_id: tgUser.id,
            username: tgUser.username || "",
            first_name: tgUser.first_name || "User",
            adc_balance: 0,
            ads_watched_today: 0,
            mining_level: 1,
            mining_rate: 5,
            wheel_spins_today: 0,
            referred_by: referrerId,
            completed_tasks: [],
          };

          const { data: createdUser } = await supabase
            .from("users")
            .upsert(newUserPayload, { onConflict: "telegram_id" })
            .select()
            .single();

          if (createdUser) {
            setAdcBalance(createdUser.adc_balance || 0);
          }
        }
      }
    }
  };

  const saveUserData = async (updatedFields: Record<string, any>) => {
    if (!user) return;
    await supabase.from("users").upsert(
      {
        telegram_id: user.id,
        username: user.username || "",
        first_name: user.first_name || "User",
        ...updatedFields,
      },
      { onConflict: "telegram_id" }
    );
  };

  const handleStartMining = async () => {
    const startTime = Date.now();
    const endTime = startTime + 24 * 60 * 60 * 1000;
    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();

    setMiningStartTime(startTime);
    setMiningEndTime(endTime);
    setMiningActive(true);
    setCurrentMined(0);

    await saveUserData({
      adc_balance: adcBalance,
      mining_start_time: startIso,
      mining_end_time: endIso,
    });
  };

  const handleClaimMining = async () => {
    const reward = miningRate * 24; 
    const newBalance = adcBalance + reward;

    setAdcBalance(newBalance);
    setMiningActive(false);
    setMiningStartTime(null);
    setMiningEndTime(null);
    setCurrentMined(0);
    setTimeLeftStr("");

    await saveUserData({
      adc_balance: newBalance,
      mining_start_time: null,
      mining_end_time: null,
    });

    alert(`🎉 Successfully claimed +${reward} ADC!`);
  };

  const handleSpinWheel = async () => {
    if (wheelSpinsToday >= 3) {
      alert("You have used all 3 free spins for today! Come back tomorrow.");
      return;
    }

    setSpinning(true);
    setWheelResult(null);

    // Prizes pool: 10, 50, 100, 250, 500, 0 (Try again)
    const prizes = [10, 25, 50, 100, 200, 500];
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];

    setTimeout(async () => {
      setSpinning(false);
      const newBalance = adcBalance + randomPrize;
      const newSpins = wheelSpinsToday + 1;

      setAdcBalance(newBalance);
      setWheelSpinsToday(newSpins);
      setWheelResult(`🎉 You won +${randomPrize} ADC!`);

      await saveUserData({
        adc_balance: newBalance,
        wheel_spins_today: newSpins,
      });
    }, 2000);
  };

  const handleWatchAd = async () => {
    if (adsToday >= 10) {
      alert("Daily limit reached (10 Ads/day)!");
      return;
    }

    window.open(MONETAG_LINK, "_blank");

    setTimeout(async () => {
      const newBalance = adcBalance + 10;
      const newAds = adsToday + 1;

      setAdcBalance(newBalance);
      setAdsToday(newAds);

      await saveUserData({
        adc_balance: newBalance,
        ads_watched_today: newAds,
      });

      alert("🎉 Earned +10 ADC!");
    }, 3000);
  };

  const handleCompleteTask = (taskId: string, link: string, reward: number) => {
    if (completedTasks.includes(taskId)) {
      alert("You have already completed this task!");
      return;
    }

    window.open(link, "_blank");
    setTaskLoading(taskId);

    setTimeout(async () => {
      const newBalance = adcBalance + reward;
      const updatedTasks = [...completedTasks, taskId];
      
      setAdcBalance(newBalance);
      setCompletedTasks(updatedTasks);
      setTaskLoading(null);

      await saveUserData({ 
        adc_balance: newBalance,
        completed_tasks: updatedTasks 
      });
      alert(`✅ Task verified! Earned +${reward} ADC!`);
    }, 10000);
  };

  const handleWithdrawRequest = async () => {
    if (!walletAddress || walletAddress.trim().length < 10) {
      alert("Please enter a valid wallet address!");
      return;
    }

    if (adcBalance < 15000) {
      alert("Minimum balance required: 15,000 ADC ($15 USDT)!");
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
      alert("✅ Withdrawal request submitted! Processing time: 24-48 hours.");
      setWalletAddress("");
    } else {
      alert("Error submitting request: " + error.message);
    }
  };

  const usdtEquivalent = (adcBalance / 1000).toFixed(2);
  const referralLink = `https://t.me/${BOT_USERNAME}/addev_rewards?startapp=${user?.id || ""}`;

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

      {/* Main Content Area */}
      <div style={{ padding: "16px" }}>
        {/* 🏠 HOME - Redesigned & Interactive */}
        {activeTab === "home" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)", padding: "20px", borderRadius: "16px", textAlign: "center", marginBottom: "16px", boxShadow: "0 10px 15px -3px rgba(2, 132, 199, 0.3)" }}>
              <div style={{ fontSize: "13px", color: "#e0f2fe" }}>Total Balance Available</div>
              <div style={{ fontSize: "34px", fontWeight: "bold", margin: "6px 0" }}>${usdtEquivalent} USDT</div>
              <div style={{ fontSize: "12px", color: "#bae6fd" }}>({adcBalance.toLocaleString()} ADC)</div>
            </div>

            {/* Quick Actions Grid */}
            <h3 style={{ fontSize: "15px", marginBottom: "10px", color: "#94a3b8" }}>⚡ Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <button 
                onClick={() => setActiveTab("mining")} 
                style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "14px", padding: "16px", textAlign: "left", cursor: "pointer", color: "#fff" }}
              >
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>⛏️</div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>Cloud Mining</div>
                <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "2px" }}>{miningRate} ADC/hr</div>
              </button>

              <button 
                onClick={() => setActiveTab("wheel")} 
                style={{ background: "#1e293b", border: "1px solid #eab308", borderRadius: "14px", padding: "16px", textAlign: "left", cursor: "pointer", color: "#fff" }}
              >
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>🎡</div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>Lucky Wheel</div>
                <div style={{ fontSize: "11px", color: "#eab308", marginTop: "2px" }}>{3 - wheelSpinsToday} spins left</div>
              </button>
            </div>

            {/* Banner to Watch Ads directly from Home */}
            <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "16px", borderRadius: "16px", border: "1px solid #38bdf8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>📺 Watch Ad & Earn</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Earn +10 ADC instantly ({adsToday}/10)</div>
              </div>
              <button 
                onClick={handleWatchAd} 
                disabled={adsToday >= 10}
                style={{ background: adsToday >= 10 ? "#475569" : "#16a34a", color: "#fff", border: "none", padding: "10px 14px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
              >
                {adsToday >= 10 ? "Done" : "Watch (+10)"}
              </button>
            </div>
          </div>
        )}

        {/* 🎡 LUCKY WHEEL (New Feature) */}
        {activeTab === "wheel" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>🎡 Lucky Wheel of Fortune</h2>
            <div style={{ background: "#1e293b", padding: "24px", borderRadius: "16px", border: "1px solid #eab308", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "60px", marginBottom: "10px" }}>
                {spinning ? "🌀" : "🎯"}
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#eab308" }}>Spin & Win Big Rewards!</h3>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
                Test your luck! You have <strong style={{ color: "#fff" }}>{3 - wheelSpinsToday}</strong> free spins remaining today.
              </p>

              {wheelResult && (
                <div style={{ background: "#0f172a", padding: "12px", borderRadius: "10px", marginBottom: "16px", color: "#22c55e", fontWeight: "bold", fontSize: "15px", border: "1px solid #22c55e" }}>
                  {wheelResult}
                </div>
              )}

              <button 
                onClick={handleSpinWheel} 
                disabled={spinning || wheelSpinsToday >= 3}
                style={{ 
                  width: "100%", 
                  padding: "14px", 
                  borderRadius: "12px", 
                  border: "none", 
                  background: wheelSpinsToday >= 3 ? "#334155" : "linear-gradient(90deg, #eab308, #ca8a04)", 
                  color: wheelSpinsToday >= 3 ? "#94a3b8" : "#000", 
                  fontWeight: "bold", 
                  cursor: wheelSpinsToday >= 3 ? "not-allowed" : "pointer",
                  fontSize: "15px"
                }}
              >
                {spinning ? "Spinning..." : wheelSpinsToday >= 3 ? "No Spins Left Today" : "🎲 Spin the Wheel!"}
              </button>
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

              {/* Live Mined Counter Display */}
              <div style={{ margin: "16px 0" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Mined So Far:</div>
                <div style={{ fontSize: "36px", fontWeight: "bold", color: "#22c55e", margin: "4px 0" }}>
                  +{currentMined.toFixed(2)} ADC
                </div>
              </div>

              <div style={{ background: "#0f172a", padding: "14px", borderRadius: "12px", margin: "16px 0", border: "1px solid #1e293b" }}>
                {miningActive ? (
                  <>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Time Remaining:</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#eab308", marginTop: "4px" }}>{timeLeftStr}</div>
                  </>
                ) : miningEndTime && !miningActive ? (
                  <>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Mining Complete!</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22c55e", marginTop: "4px" }}>+{miningRate * 24} ADC Ready</div>
                  </>
                ) : (
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>Mining is inactive. Click below to start mining!</div>
                )}
              </div>

              {!miningActive && !miningEndTime && (
                <button onClick={handleStartMining} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #0284c7, #38bdf8)", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
                  ▶ Start Mining
                </button>
              )}

              {miningActive && (
                <button disabled style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#334155", color: "#94a3b8", fontWeight: "bold" }}>
                  ⏳ Mining Live in Progress...
                </button>
              )}

              {!miningActive && miningEndTime && (
                <button onClick={handleClaimMining} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #16a34a, #22c55e)", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
                  🎉 Claim {miningRate * 24} ADC
                </button>
              )}
            </div>
          </div>
        )}

        {/* 📺 ADS */}
        {activeTab === "ads" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📺 Watch & Earn</h2>
            <div style={{ background: "#1e293b", padding: "16px", borderRadius: "16px", border: "1px solid #38bdf8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Watch Short Video</h3>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>+10 ADC per video</div>
                </div>
                <div style={{ fontWeight: "bold", color: "#22c55e" }}>{adsToday}/10</div>
              </div>
              <button onClick={handleWatchAd} disabled={adsToday >= 10} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: adsToday >= 10 ? "#475569" : "#16a34a", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
                {adsToday >= 10 ? "Daily Limit Reached (10/10)" : "Watch Ad (+10 ADC)"}
              </button>
            </div>
          </div>
        )}

        {/* 📋 TASKS */}
        {activeTab === "tasks" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📋 Tasks & Partner Deals</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Join Major App</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>Check Major Telegram bot</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+100 ADC</div>
                </div>
                <button
                  disabled={completedTasks.includes("major") || taskLoading === "major"}
                  onClick={() => handleCompleteTask("major", MAJOR_TELEGRAM_LINK, 100)}
                  style={{ background: completedTasks.includes("major") ? "#334155" : "#0284c7", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                >
                  {completedTasks.includes("major") ? "Done ✅" : taskLoading === "major" ? "Verifying..." : "Start"}
                </button>
              </div>

              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>Visit AdDev Studio</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>Discover addev-studio.com</div>
                  <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+50 ADC</div>
                </div>
                <button
                  disabled={completedTasks.includes("studio") || taskLoading === "studio"}
                  onClick={() => handleCompleteTask("studio", ADDEV_STUDIO_LINK, 50)}
                  style={{ background: completedTasks.includes("studio") ? "#334155" : "#0284c7", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                >
                  {completedTasks.includes("studio") ? "Done ✅" : taskLoading === "studio" ? "Verifying..." : "Start"}
                </button>
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
              <h3 style={{ margin: "0 0 8px 0" }}>Earn +200 ADC</h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
                Invite your friends and earn 200 ADC for each active user who joins through your link!
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  alert("📋 Invite link copied to clipboard!");
                }}
                style={{ width: "100%", padding: "12px", background: "#334155", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
              >
                📋 Copy Invite Link
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
                {adcBalance >= 15000 ? "Submit Withdrawal Request" : `Need ${(15000 - adcBalance).toLocaleString()} more ADC`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f172a", borderTop: "1px solid #334155", display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 100 }}>
        <button onClick={() => setActiveTab("home")} style={{ background: "none", border: "none", color: activeTab === "home" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>🏠<br/>Home</button>
        <button onClick={() => setActiveTab("wheel")} style={{ background: "none", border: "none", color: activeTab === "wheel" ? "#eab308" : "#64748b", fontSize: "11px", cursor: "pointer" }}>🎡<br/>Wheel</button>
        <button onClick={() => setActiveTab("mining")} style={{ background: "none", border: "none", color: activeTab === "mining" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>⛏️<br/>Mining</button>
        <button onClick={() => setActiveTab("ads")} style={{ background: "none", border: "none", color: activeTab === "ads" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>📺<br/>Ads</button>
        <button onClick={() => setActiveTab("tasks")} style={{ background: "none", border: "none", color: activeTab === "tasks" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>📋<br/>Tasks</button>
        <button onClick={() => setActiveTab("wallet")} style={{ background: "none", border: "none", color: activeTab === "wallet" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>💰<br/>Wallet</button>
      </div>
    </div>
  );
}
