import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

interface Task {
  id: number;
  title: string;
  reward: string;
  link: string;
}

// Lista e detyrave fikse (që të shfaqen gjithmonë në ekran)
const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: "Join Official Telegram Channel",
    reward: "+$0.50 USDT",
    link: "https://t.me/your_channel_here", // Ndryshoje me linkun e kanalit tënd
  },
  {
    id: 2,
    title: "Subscribe to YouTube Channel",
    reward: "+$0.50 USDT",
    link: "https://youtube.com",
  },
  {
    id: 3,
    title: "Follow on X (Twitter)",
    reward: "+$0.25 USDT",
    link: "https://x.com",
  },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [adsWatched, setAdsWatched] = useState<number>(0);
  const [loadingAd, setLoadingAd] = useState<boolean>(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  // Linku yt nga Monetag
  const MONETAG_DIRECT_LINK = "https://omg10.com/4/10168362";

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTelegramUser(user);
        fetchUserData(user.id);
      }
    }
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
    if (!error && data && data.length > 0) {
      // Nëse ka detyra në Supabase i merr ato, përndryshe mban DEFAULT_TASKS
      const formattedTasks = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        reward: `+$${(t.reward / 1000).toFixed(2)} USDT`,
        link: t.link,
      }));
      setTasks(formattedTasks);
    }
  };

  // Funksioni për shikimin e reklamës ($0.05 USDT shpërblim)
  const handleWatchAd = async () => {
    if (adsWatched >= 20) {
      alert("You have reached the daily limit of 20 ads!");
      return;
    }

    setLoadingAd(true);
    window.open(MONETAG_DIRECT_LINK, "_blank");

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

      alert("🎉 Claimed +$0.05 USDT Bonus!");
    }, 2500);
  };

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
        .update({ points: currentPoints + 500 })
        .eq("telegram_id", telegramUser.id);
    }
  };

  return (
    <div style={{ padding: "16px", color: "#fff", fontFamily: "sans-serif", paddingBottom: "90px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "16px" }}>💵 Earn USDT Rewards</h2>

      {/* Watch Ads Card */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #3b82f6",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#38bdf8" }}>🎬 Watch Video Ad</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Earn +$0.05 USDT for every ad (Max 20/day)</p>
          </div>
          <span style={{ fontWeight: "bold", color: "#22c55e", fontSize: "14px" }}>
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
            background: adsWatched >= 20 ? "#475569" : "linear-gradient(90deg, #16a34a, #22c55e)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: adsWatched >= 20 ? "not-allowed" : "pointer"
          }}
        >
          {loadingAd ? "Loading Sponsored Ad..." : "Watch Ad & Claim +$0.05 USDT"}
        </button>
      </div>

      {/* Top Offers & Airdrops */}
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>🚀 High-Paying Tasks</h3>

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
              <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: "bold" }}>
                {task.reward}
              </div>
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
