import { useState } from "react";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Wallet from "./pages/Wallet";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "tasks" | "wallet">("home");

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#fff" }}>
      {/* Përmbajtja e Faqes */}
      <main style={{ maxWidth: "500px", margin: "0 auto" }}>
        {activeTab === "home" && <Home />}
        {activeTab === "tasks" && <Tasks />}
        {activeTab === "wallet" && <Wallet />}
      </main>

      {/* Bottom Navigation Menu */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#1e293b",
        borderTop: "1px solid #334155",
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 0",
        maxWidth: "500px",
        margin: "0 auto"
      }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "home" ? "#38bdf8" : "#94a3b8",
            fontWeight: activeTab === "home" ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          🏠 Kryesore
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "tasks" ? "#38bdf8" : "#94a3b8",
            fontWeight: activeTab === "tasks" ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          🎯 Detyrat
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "wallet" ? "#38bdf8" : "#94a3b8",
            fontWeight: activeTab === "wallet" ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          👛 Portofoli
        </button>
      </nav>
    </div>
  );
}
