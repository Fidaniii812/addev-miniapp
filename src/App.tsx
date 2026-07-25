import { useState } from "react";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Wallet from "./pages/Wallet";
import Community from "./pages/Community";
import Profile from "./pages/Profile";

export default function App() {
  const [page] = useState("home");

  return (
    <Layout>
      {page === "home" && <Home />}
      {page === "tasks" && <Tasks />}
      {page === "wallet" && <Wallet />}
      {page === "community" && <Community />}
      {page === "profile" && <Profile />}
    </Layout>
  );
}
