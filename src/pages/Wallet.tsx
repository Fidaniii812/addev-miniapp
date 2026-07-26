import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Wallet() {
  const [points, setPoints] = useState<number>(0);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  // Limiti minimal për withdrawal ($15.00 USDT = 15000 points)
  const MIN_WITHDRAWAL_USD = 15.0;
  const POINTS_PER_USD = 1000;
  const MIN_POINTS_NEEDED = MIN_WITHDRAWAL_USD * POINTS_PER_USD;

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
  }, []);

  const fetchUserData = async (telegramId: number) => {
    const { data } = await supabase
      .from("users")
      .select("points")
      .eq("telegram_id", telegramId)
      .single();

    if (data && data.points !== undefined) {
      setPoints(data.points);
    }
  };

  // Llogaritja e bilancit në USDT
  const currentUsdt = (points / POINTS_PER_USD).toFixed(2);
  const progressPercent = Math.min(100, (points / MIN_POINTS_NEEDED) * 100);
  const neededUsdt = Math.max(0, MIN_WITHDRAWAL_USD - parseFloat(currentUsdt)).toFixed(2);

  return (
    <div style={{ padding: "16px", color: "#fff", fontFamily: "sans-serif", paddingBottom: "90px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "16px" }}>Your Wallet</h2>

      {/* Main Balance Card */}
      <div style={{
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        padding: "24px 16px",
        borderRadius: "20px",
        textAlign: "center",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        marginBottom: "24px"
      }}>
        <div style={{ fontSize: "14px", color: "#e0f2fe", marginBottom: "6px" }}>Total Balance</div>
        <div style={{ fontSize: "36px", fontWeight: "800", color: "#ffffff", letterSpacing: "0.5px" }}>
          ${currentUsdt} USDT
        </div>
        <div style={{ fontSize: "12px", color: "#bae6fd", marginTop: "4px" }}>
          Estimated Value: ~${currentUsdt} USD
        </div>
      </div>

      {/* Payout Threshold Section */}
      <div style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #334155"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "18px" }}>💸</span>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#f8fafc" }}>Payout Threshold</h3>
        </div>

        <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5", marginBottom: "16px" }}>
          Minimum withdrawal amount is <strong style={{ color: "#fff" }}>$15.00 USDT</strong>. Complete tasks and watch ads daily to reach the payout goal!
        </p>

        {/* Progress Bar */}
        <div style={{
          width: "100%",
          height: "10px",
          background: "#334155",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "16px"
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: "100%",
            background: "linear-gradient(90deg, #22c55e, #4ade80)",
            transition: "width 0.4s ease"
          }} />
        </div>

        {/* Withdrawal Button */}
        <button
          disabled={points < MIN_POINTS_NEEDED}
          onClick={() => alert("Withdrawal request sent! Our team will verify your balance.")}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: points >= MIN_POINTS_NEEDED ? "linear-gradient(90deg, #16a34a, #22c55e)" : "#334155",
            color: points >= MIN_POINTS_NEEDED ? "#fff" : "#94a3b8",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: points >= MIN_POINTS_NEEDED ? "pointer" : "not-allowed"
          }}
        >
          {points >= MIN_POINTS_NEEDED ? "Withdraw $15.00 USDT" : `Need $${neededUsdt} USDT More`}
        </button>
      </div>
    </div>
  );
}
