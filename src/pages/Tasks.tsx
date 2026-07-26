import { useState } from "react";

interface Task {
  id: number;
  title: string;
  reward: number;
  category: "crypto" | "social";
  link: string;
  completed: boolean;
}

export default function Tasks() {
  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(0);
  const maxAdsPerDay = 20;

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Regjistrohu te Binance Airdrop",
      reward: 500,
      category: "crypto",
      link: "https://google.com",
      completed: false,
    },
    {
      id: 2,
      title: "Krijo Llogari te Bybit Deal",
      reward: 400,
      category: "crypto",
      link: "https://google.com",
      completed: false,
    },
    {
      id: 3,
      title: "Bashkohu në Kanalin tonë Telegram",
      reward: 150,
      category: "social",
      link: "https://t.me",
      completed: false,
    },
  ]);

  const handleWatchAd = () => {
    if (adsWatchedToday >= maxAdsPerDay) {
      alert("Keni arritur limitin prej 20 reklamash për sot!");
      return;
    }
    alert("Po ngarkohet reklama...");
    setAdsWatchedToday((prev) => prev + 1);
  };

  const handleCompleteTask = (task: Task) => {
    window.open(task.link, "_blank");
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
    );
  };

  return (
    <div style={{ padding: "16px", color: "#fff", fontFamily: "sans-serif", paddingBottom: "80px" }}>
      <h2 style={{ marginBottom: "16px", fontSize: "20px" }}>Detyrat & Airdrops</h2>

      {/* SEKSIONI 1: WATCH ADS */}
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
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Shiko deri në 20 reklama sot (+50 PTS/reklamë)</p>
          </div>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "#eab308" }}>
            {adsWatchedToday}/{maxAdsPerDay}
          </span>
        </div>

        <button
          onClick={handleWatchAd}
          disabled={adsWatchedToday >= maxAdsPerDay}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: adsWatchedToday >= maxAdsPerDay ? "#475569" : "#22c55e",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: adsWatchedToday >= maxAdsPerDay ? "not-allowed" : "pointer"
          }}
        >
          {adsWatchedToday >= maxAdsPerDay ? "Limiti u arrit sot" : "Shiko Reklamën (+50 PTS)"}
        </button>
      </div>

      {/* SEKSIONI 2: CRYPTO AIRDROPS & AFFILIATE TASKS */}
      <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>🚀 Hot Airdrops & Offers</h3>
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
            {task.completed ? "Kryer" : "Hap"}
          </button>
        </div>
      ))}
    </div>
  );
}
