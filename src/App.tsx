import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [user, setUser] = useState<any>(null);
  const [adcBalance, setAdcBalance] = useState<number>(0);
  const [adsToday, setAdsToday] = useState<number>(0);

  // Mining States (Rregulluar shpejtësia në 5 ADC/hr si parazgjedhje)
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
  const [wheelRotation, setWheelRotation] = useState<number>(0);

  // Multi-Ad Watching States
  const [adBatchActive, setAdBatchActive] = useState<boolean>(false);
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(1);
  const [totalAdsInBatch] = useState<number>(3);
  const [adTimer, setAdTimer] = useState<number>(5);

  // Tasks verification states
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [taskLoading, setTaskLoading] = useState<string | null>(null);

  // Invite & Friends States
  const [invitedFriends, setInvitedFriends] = useState<any[]>([]);

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string>("");

  // ⚙️ LINKS & BOT CONFIGURATION
  const BOT_USERNAME = "addev_rewards_bot";
  const MONETAG_LINK = "https://omg10.com/4/10168362";
  const MAJOR_TELEGRAM_LINK = "https://t.me/major/start?startapp=8508477699";
  const ADDEV_STUDIO_LINK = "https://addev-studio.com";
  const OFFICIAL_BOT_LINK = `https://t.me/${BOT_USERNAME}`;

  // Çmimet e rrotës për t'i shfaqur vizualisht
  const wheelPrizes = [10, 25, 50, 100, 200, 500];

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

  // Sequential Ads Timer Logic
  useEffect(() => {
    let adInterval: any = null;
    if (adBatchActive && adTimer > 0) {
      adInterval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (adBatchActive && adTimer === 0) {
      if (currentAdIndex < totalAdsInBatch) {
        alert(`✅ Ad ${currentAdIndex} completed! Opening next ad...`);
        setCurrentAdIndex((prev) => prev + 1);
        setAdTimer(5);
        window.open(MONETAG_LINK, "_blank");
      } else {
        setAdBatchActive(false);
        finishWatchingAdBatch();
      }
    }
    return () => clearInterval(adInterval);
  }, [adBatchActive, adTimer, currentAdIndex]);

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
            const rateVal = existingUser.mining_rate || 5;
            const maxMined = rateVal * 24;

            if (end > now) {
              setMiningActive(true);
              const elapsedHours = (now - start) / (1000 * 60 * 60);
              setCurrentMined(Math.min(elapsedHours * rateVal, maxMined));
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

        const { data: friends } = await supabase
          .from("users")
          .select("first_name, username, adc_balance")
          .eq("referred_by", tgUser.id);
        
        if (friends) {
          setInvitedFriends(friends);
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

  const handleSpinWheel = () => {
    if (wheelSpinsToday >= 3) {
      alert("You have used all 3 free spins for today! Come back tomorrow.");
      return;
    }

    setSpinning(true);
    setWheelResult(null);

    const randomIndex = Math.floor(Math.random() * wheelPrizes.length);
    const randomPrize = wheelPrizes[randomIndex];

    const extraDegrees = 360 * 5 + randomIndex * (360 / wheelPrizes.length);
    setWheelRotation((prev) => prev + extraDegrees);

    setTimeout(async () => {
      setSpinning(false);
      const newBalance = adcBalance + randomPrize;
      const newSpins = wheelSpinsToday + 1;

      setAdcBalance(newBalance);
      setWheelSpinsToday(newSpins);
      setWheelResult(`🎉 Hurrah! You won +${randomPrize} ADC!`);

      await saveUserData({
        adc_balance: newBalance,
        wheel_spins_today: newSpins,
      });
    }, 3000);
  };

  const startWatchingAdBatch = () => {
    if (adsToday >= 10) {
      alert("Daily limit reached (10 batches/day)!");
      return;
    }

    setCurrentAdIndex(1);
    setAdTimer(5);
    setAdBatchActive(true);
    window.open(MONETAG_LINK, "_blank");
  };

  const finishWatchingAdBatch = async () => {
    const rewardEarned = 30;
    const newBalance = adcBalance + rewardEarned;
    const newAds = adsToday + 1;

    setAdcBalance(newBalance);
    setAdsToday(newAds);

    await saveUserData({
      adc_balance: newBalance,
      ads_watched_today: newAds,
    });

    alert("🎉 All 3 ads completed successfully! Earned +30 ADC!");
  };

  const handleDirectShare = (title: string, text: string, url: string) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url,
      }).catch((error) => console.log("Sharing failed", error));
    } else {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      window.open(shareUrl, "_blank");
    }
  };

  const handleJoinBotTask = (taskId: string, link: string, reward: number) => {
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
      alert(`✅ Task verified successfully! Earned +${reward} ADC!`);
    }, 8000);
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
        {/* 🏠 HOME */}
        {activeTab === "home" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)", padding: "20px", borderRadius: "16px", textAlign: "center", marginBottom: "16px", boxShadow: "0 10px 15px -3px rgba(2, 132, 199, 0.3)" }}>
              <div style={{ fontSize: "13px", color: "#e0f2fe" }}>Total Balance Available</div>
              <div style={{ fontSize: "34px", fontWeight: "bold", margin: "6px 0" }}>${usdtEquivalent} USDT</div>
              <div style={{ fontSize: "12px", color: "#bae6fd" }}>({adcBalance.toLocaleString()} ADC)</div>
            </div>

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

            <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "16px", borderRadius: "16px", border: "1px solid #38bdf8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>📺 Watch 3 Ads & Earn</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>3 ads (5s each) • +30 ADC</div>
              </div>
              <button 
                onClick={() => setActiveTab("ads")} 
                style={{ background: "#16a34a", color: "#fff", border: "none", padding: "10px 14px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
              >
                Earn (+30)
              </button>
            </div>
          </div>
        )}

        {/* 🎡 LUCKY WHEEL (Me numrat e shfaqur brenda fildave të rrotës) */}
        {activeTab === "wheel" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>🎡 Lucky Wheel of Fortune</h2>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #eab308", textAlign: "center", marginBottom: "16px" }}>
              
              <div style={{ position: "relative", width: "220px", height: "220px", margin: "0 auto 16px auto" }}>
                {/* Shigjeta lart */}
                <div style={{ position: "absolute", top: "-14px", left: "calc(50% - 12px)", width: "0", height: "0", borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderBottom: "22px solid #ef4444", zIndex: 20, filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }}></div>

                {/* Rrota */}
                <div style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "conic-gradient(#eab308 0deg 60deg, #38bdf8 60deg 120deg, #22c55e 120deg 180deg, #a855f7 180deg 240deg, #ec4899 240deg 300deg, #f97316 300deg 360deg)",
                  border: "4px solid #fff",
                  boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: spinning ? "transform 3s cubic-bezier(0.15, 0.9, 0.2, 1)" : "none",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Numrat e vendosur brenda çdo seksioni */}
                  <span style={{ position: "absolute", top: "25%", left: "62%", transform: "rotate(30deg)", fontWeight: "bold", fontSize: "14px", color: "#000", textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>10</span>
                  <span style={{ position: "absolute", top: "52%", left: "70%", transform: "rotate(90deg)", fontWeight: "bold", fontSize: "14px", color: "#000", textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>25</span>
                  <span style={{ position: "absolute", top: "72%", left: "55%", transform: "rotate(150deg)", fontWeight: "bold", fontSize: "14px", color: "#000", textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}>50</span>
                  <span style={{ position: "absolute", top: "65%", left: "28%", transform: "rotate(210deg)", fontWeight: "bold", fontSize: "14px", color: "#fff", textShadow: "0 1px 0 rgba(0,0,0,0.6)" }}>100</span>
                  <span style={{ position: "absolute", top: "42%", left: "18%", transform: "rotate(270deg)", fontWeight: "bold", fontSize: "14px", color: "#fff", textShadow: "0 1px 0 rgba(0,0,0,0.6)" }}>200</span>
                  <span style={{ position: "absolute", top: "20%", left: "35%", transform: "rotate(330deg)", fontWeight: "bold", fontSize: "14px", color: "#fff", textShadow: "0 1px 0 rgba(0,0,0,0.6)" }}>500</span>

                  {/* Qendra e rrotës */}
                  <div style={{ position: "absolute", top: "calc(50% - 20px)", left: "calc(50% - 20px)", width: "40px", height: "40px", background: "#0f172a", borderRadius: "50%", border: "2px solid #fff", zIndex: 10 }}></div>
                </div>
              </div>

              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#eab308" }}>Spin the Wheel & Win!</h3>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "14px" }}>
                Free spins remaining today: <strong style={{ color: "#fff" }}>{3 - wheelSpinsToday} / 3</strong>
              </p>

              {wheelResult && (
                <div style={{ background: "#0f172a", padding: "10px", borderRadius: "10px", marginBottom: "14px", color: "#22c55e", fontWeight: "bold", fontSize: "14px", border: "1px solid #22c55e" }}>
                  {wheelResult}
                </div>
              )}

              <button 
                onClick={handleSpinWheel} 
                disabled={spinning || wheelSpinsToday >= 3}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: "12px", 
                  border: "none", 
                  background: wheelSpinsToday >= 3 ? "#334155" : "linear-gradient(90deg, #eab308, #ca8a04)", 
                  color: wheelSpinsToday >= 3 ? "#94a3b8" : "#000", 
                  fontWeight: "bold", 
                  cursor: wheelSpinsToday >= 3 ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                {spinning ? "Wheel is spinning..." : wheelSpinsToday >= 3 ? "No Spins Left Today" : "🎲 Spin Now!"}
              </button>
            </div>
          </div>
        )}

        {/* ⛏️ MINING (Shfaq shpejtësinë e saktë 'miningRate' në vend të numrit fiks 20) */}
        {activeTab === "mining" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>⛏️ Cloud Mining</h2>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Mining Speed Level {miningLevel}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#38bdf8", margin: "8px 0" }}>
                {miningRate} ADC / hour
              </div>

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
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📺 Watch 3 Ads Sequence</h2>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #38bdf8", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎬</div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>Monetag Ad Series</h3>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
                Watch 3 ads in a row (5s each) to earn <strong style={{ color: "#22c55e" }}>+30 ADC</strong>. Progress: <strong style={{ color: "#38bdf8" }}>{adsToday}/10 batches</strong>
              </div>

              {adBatchActive ? (
                <div style={{ background: "#0f172a", padding: "16px", borderRadius: "12px", border: "1px solid #eab308", marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", color: "#eab308", fontWeight: "bold" }}>
                    ⏳ Watching Ad {currentAdIndex} of {totalAdsInBatch}
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#fff", margin: "6px 0" }}>{adTimer}s</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Please keep the window open. Next ad will load automatically!</div>
                </div>
              ) : (
                <button 
                  onClick={startWatchingAdBatch} 
                  disabled={adsToday >= 10}
                  style={{ 
                    width: "100%", 
                    padding: "14px", 
                    borderRadius: "12px", 
                    border: "none", 
                    background: adsToday >= 10 ? "#475569" : "linear-gradient(90deg, #16a34a, #22c55e)", 
                    color: "#fff", 
                    fontWeight: "bold", 
                    cursor: adsToday >= 10 ? "not-allowed" : "pointer",
                    fontSize: "15px"
                  }}
                >
                  {adsToday >= 10 ? "Daily Limit Reached (10/10)" : "▶ Start 3-Ad Series (+30 ADC)"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 📋 TASKS */}
        {activeTab === "tasks" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>📋 Tasks & Partner Deals</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Task 1: Major App */}
              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>Join Major App</div>
                    <div style={{ color: "#94a3b8", fontSize: "11px" }}>Interact with Major Bot</div>
                    <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+100 ADC</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button
                    onClick={() => handleDirectShare("Join Major App", "Check out Major App and earn rewards!", MAJOR_TELEGRAM_LINK)}
                    style={{ background: "#334155", color: "#fff", border: "1px solid #64748b", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
                  >
                    📤 Share
                  </button>
                  <button
                    disabled={completedTasks.includes("major") || taskLoading === "major"}
                    onClick={() => handleJoinBotTask("major", MAJOR_TELEGRAM_LINK, 100)}
                    style={{ background: completedTasks.includes("major") ? "#334155" : "#0284c7", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
                  >
                    {completedTasks.includes("major") ? "Done ✅" : taskLoading === "major" ? "Checking..." : "🤖 Join Bot"}
                  </button>
                </div>
              </div>

              {/* Task 2: AdDev Studio */}
              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>Visit AdDev Studio</div>
                    <div style={{ color: "#94a3b8", fontSize: "11px" }}>Explore addev-studio.com</div>
                    <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+50 ADC</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button
                    onClick={() => handleDirectShare("Visit AdDev Studio", "Explore addev-studio.com for awesome development solutions!", ADDEV_STUDIO_LINK)}
                    style={{ background: "#334155", color: "#fff", border: "1px solid #64748b", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
                  >
                    📤 Share
                  </button>
                  <button
                    disabled={completedTasks.includes("studio") || taskLoading === "studio"}
                    onClick={() => handleJoinBotTask("studio", ADDEV_STUDIO_LINK, 50)}
                    style={{ background: completedTasks.includes("studio") ? "#334155" : "#0284c7", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
                  >
                    {completedTasks.includes("studio") ? "Done ✅" : taskLoading === "studio" ? "Checking..." : "🌐 Visit Link"}
                  </button>
                </div>
              </div>

              {/* Task 3: Official Rewards Bot */}
              <div style={{ background: "#1e293b", padding: "14px", borderRadius: "12px", border: "1px solid #334155" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>AdDev Rewards Bot</div>
                    <div style={{ color: "#94a3b8", fontSize: "11px" }}>Open official Telegram bot</div>
                    <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "bold", marginTop: "2px" }}>+75 ADC</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button
                    onClick={() => handleDirectShare("AdDev Rewards Bot", "Join AdDev Rewards Bot to earn crypto daily!", OFFICIAL_BOT_LINK)}
                    style={{ background: "#334155", color: "#fff", border: "1px solid #64748b", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
                  >
                    📤 Share
                  </button>
                  <button
                    disabled={completedTasks.includes("official_bot") || taskLoading === "official_bot"}
                    onClick={() => handleJoinBotTask("official_bot", OFFICIAL_BOT_LINK, 75)}
                    style={{ background: completedTasks.includes("official_bot") ? "#334155" : "#0284c7", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}
                  >
                    {completedTasks.includes("official_bot") ? "Done ✅" : taskLoading === "official_bot" ? "Checking..." : "🤖 Open Bot"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 👥 INVITE & FRIENDS */}
        {activeTab === "invite" && (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>👥 Invite Friends</h2>
            <div style={{ background: "#1e293b", padding: "20px", borderRadius: "16px", textAlign: "center", border: "1px solid #334155", marginBottom: "16px" }}>
              <div style={{ fontSize: "36px", marginBottom: "6px" }}>🎁</div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>Earn +200 ADC per Friend</h3>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
                Share your personal link and get rewarded when your friends join!
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  onClick={() => handleDirectShare("AdDev Rewards", "Join AdDev Rewards and earn crypto together!", referralLink)}
                  style={{ 
                    padding: "12px 10px", 
                    background: "#334155", 
                    color: "#fff", 
                    border: "1px solid #64748b", 
                    borderRadius: "10px", 
                    fontWeight: "bold", 
                    cursor: "pointer", 
                    fontSize: "13px" 
                  }}
                >
                  📤 Share Link
                </button>

                <button
                  onClick={() => window.open(OFFICIAL_BOT_LINK, "_blank")}
                  style={{ 
                    padding: "12px 10px", 
                    background: "linear-gradient(90deg, #0284c7, #38bdf8)", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "10px", 
                    fontWeight: "bold", 
                    cursor: "pointer", 
                    fontSize: "13px" 
                  }}
                >
                  🤖 Join Bot
                </button>
              </div>
            </div>

            <div style={{ background: "#1e293b", padding: "16px", borderRadius: "16px", border: "1px solid #334155" }}>
              <h3 style={{ fontSize: "14px", margin: "0 0 10px 0", color: "#94a3b8" }}>Your Invited Friends ({invitedFriends.length})</h3>
              {invitedFriends.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center", padding: "12px" }}>No friends invited yet. Start sharing your link!</div>
              ) : (
                invitedFriends.map((friend, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #334155", fontSize: "13px" }}>
                    <span>{friend.first_name || friend.username || "User"}</span>
                    <span style={{ color: "#22c55e", fontWeight: "bold" }}>+200 ADC</span>
                  </div>
                ))
              )}
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
        <button onClick={() => setActiveTab("invite")} style={{ background: "none", border: "none", color: activeTab === "invite" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>👥<br/>Invite</button>
        <button onClick={() => setActiveTab("wallet")} style={{ background: "none", border: "none", color: activeTab === "wallet" ? "#38bdf8" : "#64748b", fontSize: "11px", cursor: "pointer" }}>💰<br/>Wallet</button>
      </div>
    </div>
  );
}
