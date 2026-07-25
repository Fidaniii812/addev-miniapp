import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Wallet from "./pages/Wallet";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import { initializeTelegram } from "./lib/telegram";

export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => {
    // Inicializon Telegram WebApp automatikisht
    initializeTelegram();
  }, []);

  return (
    <Layout currentPage={page} onChangePage={setPage}>
      {page === "home" && <Home />}
      {page === "tasks" && <Tasks />}
      {page === "wallet" && <Wallet />}
      {page === "community" && <Community />}
      {page === "profile" && <Profile />}
    </Layout>
  );
}
