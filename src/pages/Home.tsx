import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Home() {
  const [points, setPoints] = useState<number>(0);
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    // Hapja në Full Screen dhe leximi i të dhënave nga Telegram
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTelegramUser(user);
        syncUserWithSupabase(user);
      }
    }
  }, []);

  // Sinkronizimi i përdoruesit me Supabase Database
  const syncUserWithSupabase = async (user: any) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // Përdorues i ri -> Krijo profilin me 1250 PTS fillestare
      const { data: newUser } = await supabase
        .from("users")
        .insert([{
          telegram_id: user.id,
          username: user.username || "",
          first_name: user.first_name || "",
          points: 1250
        }])
        .select()
        .single();
      
      if (newUser) setPoints(newUser.points);
    } else if (data) {
      // Përdorues ekzistues -> Merri pikët reale nga Database
      setPoints(data.points);
    }
  };

  const handleDailyClaim = async () => {
    if (claimedToday) return;

    const newBalance = points + 100;
    setPoints(newBalance);
    setClaimedToday(true);

    if (telegramUser) {
      await supabase
        .from("users")
        .update({ points: newBalance })
        .eq("telegram_id", telegramUser.id);
    }

    alert("You claimed +100 PTS for today!");
  };

  return (
    <div style={{ padding: "16px", color: "#fff", fontFamily: "sans-serif", paddingBottom: "80px", minHeight: "100vh" }}>
      {/* Main Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0284c7, #0f172a)",
        padding: "24px 16px",
        borderRadius: "20px",
        textAlign: "center",
        border: "1px solid #38bdf8",
        marginBottom: "20px"
      }}>
        <div style={{ fontSize: "14px", color: "#93c5fd" }}>
          Welcome {telegramUser?.first_name ? telegramUser.first_name : "to AdDev Rewards"}
        </div>
        <div style={{ fontSize: "36px", fontWeight: "bold", margin: "10px 0" }}>
          {points.toLocaleString()} <span style={{ fontSize: "20px", color: "#38bdf8" }}>PTS</span>
        </div>
        <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0 }}>
          Complete tasks, watch ads, and earn daily rewards!
        </p>
      </div>

      {/* Daily Check-In */}
      <div style={{
        background: "#1e293b",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #334155",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>🎁 Daily Reward</h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Claim +100 PTS every day</p>
          </div>
          <button
            onClick={handleDailyClaim}
            disabled={claimedToday}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              background: claimedToday ? "#475569" : "#22c55e",
              color: "#fff",
              fontWeight: "bold",
              cursor: claimedToday ? "not-allowed" : "pointer"
            }}
          >
            {claimedToday ? "Claimed" : "Claim +100"}
          </button>
        </div>
      </div>

      {/* Hot Offer of the Day */}
      <div style={{
        background: "#1e293b",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #334155"
      }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#eab308" }}>🔥 Hot Offer of the Day</h3>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "12px" }}>
          Join Blum Airdrop today and earn bonus rewards!
        </p>
        <button
          onClick={() => window.open("https://t.me/blum/app?startapp=ref_LL9thrrMxR", "_blank")}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background: "#0284c7",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Open Blum Offer
        </button>
      </div>
    </div>
  );
}
