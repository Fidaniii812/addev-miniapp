import { useState } from "react";

interface Task {
  id: number;
  title: string;
  reward: number;
  category: "crypto" | "affiliate" | "telegram";
  link: string;
  completed: boolean;
}

export default function Tasks() {
  const [adsWatched, setAdsWatched] = useState<number>(0);
  const maxDailyAds = 20;

  // LISTA E PLOTË E LINQEVE TË TUA DHE AIRDROPS KRYESORE
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Join Blum Airdrop & Earn Points",
      reward: 500,
      category: "crypto",
      link: "https://t.me/blum/app?startapp=ref_LL9thrrMxR",
      completed: false,
    },
    {
      id: 2,
      title: "Claim TonWave Mining Bonus",
      reward: 450,
      category: "crypto",
      link: "https://t.me/TonWave_1Bot/ton?startapp=8508477699",
      completed: false,
    },
    {
      id: 3,
      title: "Start Bitcoin Crane Web Mining",
      reward: 350,
      category: "crypto",
      link: "https://www.bitcoincrane.com?ref=b216127",
      completed: false,
    },
    {
      id: 4,
      title: "Join Bitcoin Crane Telegram Bot",
      reward: 300,
      category: "telegram",
      link: "https://t.me/BitcoinCrane_bot?start=b216127",
      completed: false,
    },
    {
      id: 5,
      title: "Claim Money Plus App Reward",
      reward: 400,
      category: "crypto",
      link: "https://t.me/Money_Plus12_Bot/moneyplus?startapp=8508477699",
      completed: false,
    },
    {
      id: 6,
      title: "Claim Cash Plus Bonus",
      reward: 400,
      category: "crypto",
      link: "https://t.me/CashPlus_Bot/cashplus?startapp=8508477699",
      completed: false,
    },
    {
      id: 7,
      title: "Join Admitad Partner Network",
      reward: 600,
      category: "affiliate",
      link: "https://www.admitad.com/affiliate-publishers/?ref=kaw95ey05k",
      completed: false,
    },
    {
      id: 8,
      title: "Join PAWS Viral Telegram Airdrop",
      reward: 500,
      category: "crypto",
      link: "https://t.me/PAWSOGBot",
      completed: false,
    },
  ]);

  const handleWatchAd = () => {
    if (adsWatched >= maxDailyAds) {
      alert("Daily limit reached! Come back tomorrow.");
      return;
    }
    alert("Loading sponsored video ad...");
    setAdsWatched((prev) => prev + 1);
  };

  const handleCompleteTask = (task: Task) => {
    window.open(task.link, "_blank");
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
    );
  };

  return (
    <div style={{ padding: "16px", color: "#fff", paddingBottom: "80px" }}>
      <h2 style={{ marginBottom: "16px", fontSize: "20px" }}>Earn Rewards</h2>

      {/* WATCH ADS SECTION */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #334155",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#38bdf8" }}>🎬 Watch Ads & Earn</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Watch up to 20 ads daily (+50 PTS each)</p>
          </div>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "#eab308" }}>
            {adsWatched}/{maxDailyAds}
          </span>
        </div>

        <button
          onClick={handleWatchAd}
          disabled={adsWatched >= maxDailyAds}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: adsWatched >= maxDailyAds ? "#475569" : "#22c55e",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: adsWatched >= maxDailyAds ? "not-allowed" : "pointer"
          }}
        >
          {adsWatched >= maxDailyAds ? "Daily Limit Reached" : "Watch Video Ad (+50 PTS)"}
        </button>
      </div>

      {/* FEATURED OFFERS & AIRDROPS */}
      <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>🚀 Top Offers & Airdrops</h3>
      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            background: "#1e293b",
            padding: "14px",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            border: "1px solid #334155"
          }}
        >
          <div>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>{task.title}</div>
            <div style={{ fontSize: "12px", color: "#38bdf8", marginTop: "2px" }}>+{task.reward} PTS</div>
          </div>
          <button
            onClick={() => handleCompleteTask(task)}
            disabled={task.completed}
            style={{
              backgroundColor: task.completed ? "#475569" : "#0284c7",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: task.completed ? "not-allowed" : "pointer"
            }}
          >
            {task.completed ? "Done" : "Start"}
          </button>
        </div>
      ))}
    </div>
  );
}
