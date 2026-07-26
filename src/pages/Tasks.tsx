import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

interface Task {
  id: number;
  title: string;
  reward: number;
  category: string;
  link: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adsWatched, setAdsWatched] = useState<number>(0);
  const [loadingAd, setLoadingAd] = useState<boolean>(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  // Linku yt nga Monetag
  const MONETAG_DIRECT_LINK = "https://omg10.com/4/10168362";

  useEffect(() => {
    // 1. Lexo të dhënat e përdoruesit nga Telegram
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTelegramUser(user);
        fetchUserData(user.id);
      }
    }

    // 2. Lexo detyrat nga Supabase
    fetchTasks();
  }, []);

  const fetchUserData = async (telegramId: number) => {
    const { data } = await supabase
      .from("users")
      .select("ads_watched")
      .eq("telegram_id", telegramId)
      .single();

    if (data && data.ads_watched !== undefined) {
      setAdsWatched(data.ads_watched);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (!error && data) {
      setTasks(data);
    }
  };

  // Funksioni për shikimin e reklamës
  const handleWatchAd = async () => {
    if (adsWatched >= 20) {
      alert("You have reached the daily limit of 20 ads!");
      return;
    }

    setLoadingAd(true);

    // Hap reklamën Monetag në dritare të re
    window.open(MONETAG_DIRECT_LINK, "_blank");

    // Pas 2.5 sekondash shton pikët te përdoruesi
    setTimeout(async () => {
      setLoadingAd(false);
      const newAdsCount = adsWatched + 1;
      setAdsWatched(newAdsCount);

      if (telegramUser) {
        const { data: user } = await supabase
          .from("users")
          .select("points")
          .eq("telegram_id", telegramUser.id)
          .single();

        const currentPoints = user?.points || 0;

        await supabase
          .from("users")
          .update({
            points: currentPoints + 50,
            ads_watched: newAdsCount,
          })
          .eq("telegram_id", telegramUser.id);
      }

      alert("🎉 You watched an ad and earned +50 PTS!");
    }, 2500);
  };

  // Funksioni për Airdrops / Offers
  const handleStartTask = async (task: Task) => {
    window.open(task.link, "_blank");

    if (telegramUser) {
      const { data: user } = await supabase
        .from("users")
        .select("points")
        .eq("telegram_id", telegramUser.id)
        .single();

      const currentPoints = user?.points || 0;

      await supabase
        .from("users")
        .update({ points: currentPoints + task.reward })
        .eq("telegram_id", telegramUser.id);
    }
  };

  return (
    <div style={{ padding: "16px", color: "#fff", fontFamily: "sans-serif", paddingBottom: "90px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "16px" }}>Earn Rewards</h2>

      {/* Watch Ads Card */}
      <div style={{
        background: "#1e293b",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #334155",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#38bdf8" }}>🎬 Watch Ads & Earn</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Watch up to 20 ads daily (+50 PTS each)</p>
          </div>
          <span style={{ fontWeight: "bold", color: "#eab308", fontSize: "14px" }}>
            {adsWatched}/20
          </span>
        </div>

        <button
          onClick={handleWatchAd}
          disabled={loadingAd || adsWatched >= 20}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: adsWatched >= 20 ? "#475569" : "#16a34a",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: adsWatched >= 20 ? "not-allowed" : "pointer"
          }}
        >
          {loadingAd ? "Loading sponsored video ad..." : "Watch Video Ad (+50 PTS)"}
        </button>
      </div>

      {/* Top Offers & Airdrops */}
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>🚀 Top Offers & Airdrops</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              background: "#1e293b",
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid #334155",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "4px" }}>{task.title}</div>
              <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "bold" }}>+{task.reward} PTS</div>
            </div>
            <button
              onClick={() => handleStartTask(task)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: "#0284c7",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Start
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
