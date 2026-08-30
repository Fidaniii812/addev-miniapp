import React, { useEffect, useMemo, useState } from "react";
import {
  Home,
  CheckSquare,
  Users,
  Trophy,
  Flame,
  Gamepad2,
  ShieldCheck,
  ExternalLink,
  Coins,
  Wallet,
  ArrowUpRight,
  PlaySquare,
  Copy,
  CheckCircle2,
  Star,
  Cpu,
  Zap,
  X,
  Gift,
  BarChart3,
} from "lucide-react";

/* =========================================================
   TELEGRAM TYPES
========================================================= */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        ready?: () => void;
        expand?: () => void;
        disableVerticalSwipes?: () => void;
        openLink?: (url: string) => void;
        openTelegramLink?: (url: string) => void;
        openInvoice?: (
          url: string,
          callback?: (status: string) => void
        ) => void;
        showPopup?: (
          params: {
            title?: string;
            message: string;
            buttons?: Array<{
              id: string;
              type?: string;
              text?: string;
            }>;
          },
          callback?: (id: string) => void
        ) => void;
        HapticFeedback?: {
          impactOccurred?: (
            style: "light" | "medium" | "heavy" | "rigid" | "soft"
          ) => void;
          notificationOccurred?: (
            type: "error" | "success" | "warning"
          ) => void;
        };
      };
    };

    Adsgram?: {
      init: (config: {
        blockId: string;
        debug?: boolean;
      }) => {
        show: () => Promise<void>;
      };
    };
  }
}

/* =========================================================
   CONSTANTS
========================================================= */

const APP_NAME = "AdDev Rewards";

const ADSGRAM_BLOCK_ID = "45299";

const CPX_APP_ID = "34909";

const MIN_WITHDRAW = 75000;

const MAX_ENERGY = 1000;

const ENERGY_REGEN_MS = 1500;

const MINING_INTERVAL_MS = 2000;

const TAP_REWARD = 1;

const AD_REWARD = 250;

const REFERRAL_REWARD = 1000;

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEYS = {
  coins: "addev_coins",
  energy: "addev_energy",
  minedCoins: "addev_mined_coins",
  streak: "addev_streak",
  wallet: "addev_wallet",
  lastOpen: "addev_last_open",
};

/* =========================================================
   HELPERS
========================================================= */

function readNumber(key: string, fallback: number): number {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readString(key: string, fallback = ""): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function saveValue(key: string, value: string | number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage errors.
  }
}

/* =========================================================
   TELEGRAM USER
========================================================= */

function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user;
}

function getTelegramUserId(): string {
  const telegramId = getTelegramUser()?.id;

  if (telegramId) {
    return String(telegramId);
  }

  return "8508477699";
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const telegramUser = getTelegramUser();
  const telegramUserId = getTelegramUserId();

  const telegramUsername =
    telegramUser?.username ||
    telegramUser?.first_name ||
    "AdDev Rewards User";

  /* -------------------------------------------------------
     Main state
  ------------------------------------------------------- */

  const [coins, setCoins] = useState<number>(() =>
    readNumber(STORAGE_KEYS.coins, 15432)
  );

  const [energy, setEnergy] = useState<number>(() =>
    readNumber(STORAGE_KEYS.energy, MAX_ENERGY)
  );

  const [minedCoins, setMinedCoins] = useState<number>(() =>
    readNumber(STORAGE_KEYS.minedCoins, 0)
  );

  const [dailyStreak] = useState<number>(() =>
    readNumber(STORAGE_KEYS.streak, 6)
  );

  const [connectedWallet, setConnectedWallet] = useState<string>(() =>
    readString(STORAGE_KEYS.wallet, "")
  );

  const [activeTab, setActiveTab] = useState<string>("home");

  const [showOfferwallModal, setShowOfferwallModal] =
    useState<boolean>(false);

  const [isWatchingAd, setIsWatchingAd] =
    useState<boolean>(false);

  const [isConnectingWallet, setIsConnectingWallet] =
    useState<boolean>(false);

  const [withdrawAmount, setWithdrawAmount] =
    useState<string>("");

  const [isSubmittingWithdraw, setIsSubmittingWithdraw] =
    useState<boolean>(false);

  const [copiedRef, setCopiedRef] =
    useState<boolean>(false);

  const [tapAnimation, setTapAnimation] =
    useState<number>(0);

  /* -------------------------------------------------------
     Stable referral link
  ------------------------------------------------------- */

  const referralLink = useMemo(() => {
    return `https://t.me/AdDevRewardsBot?start=ref_${telegramUserId}`;
  }, [telegramUserId]);

  /* -------------------------------------------------------
     CPX Offerwall URL
  ------------------------------------------------------- */

  const cpxOfferwallUrl = useMemo(() => {
    return (
      `https://offers.cpx-research.com/index.php` +
      `?app_id=${encodeURIComponent(CPX_APP_ID)}` +
      `&ext_user_id=${encodeURIComponent(telegramUserId)}`
    );
  }, [telegramUserId]);

  /* =======================================================
     TELEGRAM INITIALIZATION
  ======================================================= */

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      return;
    }

    try {
      tg.ready?.();
      tg.expand?.();
      tg.disableVerticalSwipes?.();
    } catch (error) {
      console.log("Telegram WebApp initialization error:", error);
    }
  }, []);

  /* =======================================================
     SAVE STATES TO LOCALSTORAGE
  ======================================================= */

  useEffect(() => {
    saveValue(STORAGE_KEYS.coins, coins);
  }, [coins]);

  useEffect(() => {
    saveValue(STORAGE_KEYS.energy, energy);
  }, [energy]);

  useEffect(() => {
    saveValue(STORAGE_KEYS.minedCoins, minedCoins);
  }, [minedCoins]);

  useEffect(() => {
    saveValue(STORAGE_KEYS.wallet, connectedWallet);
  }, [connectedWallet]);

  /* =======================================================
     ENERGY REGENERATION
  ======================================================= */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEnergy((previous) => {
        if (previous >= MAX_ENERGY) {
          return MAX_ENERGY;
        }
        return Math.min(previous + 1, MAX_ENERGY);
      });
    }, ENERGY_REGEN_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /* =======================================================
     CLOUD MINING
  ======================================================= */

  useEffect(() => {
    const miningTimer = window.setInterval(() => {
      setMinedCoins((previous) => previous + 1);
    }, MINING_INTERVAL_MS);

    return () => {
      window.clearInterval(miningTimer);
    };
  }, []);

  /* =======================================================
     HAPTIC FEEDBACK
  ======================================================= */

  const haptic = (
    type: "light" | "medium" | "heavy" = "light"
  ) => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(
        type
      );
    } catch {
      // Ignore haptic errors.
    }
  };

  /* =======================================================
     TAP / PLAY
  ======================================================= */

  const handleTap = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (energy <= 0) {
      haptic("heavy");
      return;
    }

    setCoins((previous) => previous + TAP_REWARD);
    setEnergy((previous) => Math.max(previous - 1, 0));
    setTapAnimation((previous) => previous + 1);
    haptic("light");

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const floatingElement = document.createElement("div");
    floatingElement.className =
      "absolute text-yellow-400 font-extrabold text-lg pointer-events-none z-30";
    floatingElement.style.left = `${x}px`;
    floatingElement.style.top = `${y}px`;
    floatingElement.style.transform = "translate(-50%, -50%)";
    floatingElement.style.transition = "all 700ms ease-out";
    floatingElement.innerText = "+1";

    target.appendChild(floatingElement);

    requestAnimationFrame(() => {
      floatingElement.style.transform = "translate(-50%, -100px)";
      floatingElement.style.opacity = "0";
    });

    window.setTimeout(() => {
      floatingElement.remove();
    }, 750);
  };

  /* =======================================================
     ADSGRAM INTEGRATION (Block ID: 45299)
  ======================================================= */

  const handleWatchAdsgram = async () => {
    if (isWatchingAd) {
      return;
    }

    const adsgram = window.Adsgram;

    if (!adsgram) {
      alert(
        "Adsgram is not available. Please open AdDev Rewards inside Telegram."
      );
      return;
    }

    setIsWatchingAd(true);
    haptic("medium");

    try {
      const controller = adsgram.init({
        blockId: ADSGRAM_BLOCK_ID,
        debug: false,
      });

      await controller.show();

      setCoins((previous) => previous + AD_REWARD);

      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.(
          "success"
        );
      } catch {
        // Ignore.
      }

      alert(`Urime! Fituat +${AD_REWARD} Pikë (AdCoins).`);
    } catch (error) {
      console.log("Adsgram ad failed or was closed:", error);
      alert("Reklama u mbyll, u anua ose nuk është e disponueshme për momentin.");
    } finally {
      setIsWatchingAd(false);
    }
  };

  /* =======================================================
     CLAIM MINING
  ======================================================= */

  const handleClaimMined = () => {
    if (minedCoins <= 0) {
      alert("Nuk keni pikë të minuara për t'i tërhequr ende.");
      return;
    }

    const amount = minedCoins;
    setCoins((previous) => previous + amount);
    setMinedCoins(0);
    haptic("medium");
    alert(`Mblodhët me sukses ${amount.toLocaleString()} pikë nga minimi.`);
  };

  /* =======================================================
     WALLET CONNECTION
  ======================================================= */

  const handleConnectWallet = async () => {
    if (connectedWallet) {
      return;
    }

    setIsConnectingWallet(true);
    haptic("medium");

    window.setTimeout(() => {
      const demoWallet = "EQD4...9xK2";
      setConnectedWallet(demoWallet);
      setIsConnectingWallet(false);
      alert("Portofoli u lidh me sukses!");
    }, 700);
  };

  /* =======================================================
     WITHDRAW
  ======================================================= */

  const handleWithdraw = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const amount = Number(withdrawAmount);

    if (!connectedWallet) {
      alert("Ju lutem lidhni portofolin tuaj TON fillimisht.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Ju lutem shkruani një sasi të vlefshme për tërheqje.");
      return;
    }

    if (amount < MIN_WITHDRAW) {
      alert(`Tërheqja minimale është ${MIN_WITHDRAW.toLocaleString()} Pikë.`);
      return;
    }

    if (amount > coins) {
      alert("Nuk keni mjaftueshëm pikë në balancën tuaj.");
      return;
    }

    setIsSubmittingWithdraw(true);

    window.setTimeout(() => {
      setCoins((previous) => previous - amount);
      setWithdrawAmount("");
      setIsSubmittingWithdraw(false);
      haptic("medium");
      alert("Kërkesa për tërheqje u dërgua me sukses!");
    }, 1000);
  };

  /* =======================================================
     COPY REFERRAL
  ======================================================= */

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedRef(true);
      haptic("light");

      window.setTimeout(() => {
        setCopiedRef(false);
      }, 2000);
    } catch {
      alert("Nuk u mundësua kopjimi i linkut.");
    }
  };

  /* =======================================================
     TELEGRAM STARS SHOP
  ======================================================= */

  const handleBuyWithStarsReal = async (
    packageType: string,
    starCost: number,
    amountToAdd: number
  ) => {
    const tg = window.Telegram?.WebApp;

    try {
      const response = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: telegramUserId,
          packageType,
          starCost,
          amountToAdd,
        }),
      });

      const data = await response.json();
      if (!data.invoiceLink) {
        throw new Error(data.error || "Nuk u gjenerua linku i faturës");
      }

      if (tg && tg.openInvoice) {
        tg.openInvoice(data.invoiceLink, async (status: string) => {
          if (status === "paid") {
            if (amountToAdd > 0) {
              setCoins((previous) => previous + amountToAdd);
            } else {
              setEnergy(MAX_ENERGY);
            }
            haptic("medium");
            alert(`Pagesa u krye me sukses! U shtua: ${packageType}.`);
          } else if (status === "cancelled") {
            alert("Pagesa u anua.");
          } else {
            alert("Pagesa dështoi.");
          }
        });
      } else {
        alert(
          `OpenInvoice funksionon vetëm brenda Telegram App.\n\nPaketa: ${packageType} (${starCost} Stars)`
        );
      }
    } catch {
      // Demo fallback in case backend endpoint isn't active
      if (amountToAdd > 0) {
        setCoins((prev) => prev + amountToAdd);
      } else {
        setEnergy(MAX_ENERGY);
      }
      haptic("medium");
      alert(`Simulim Blerjeje me Stars: U shtua ${packageType} me sukses!`);
    }
  };

  const refillEnergyDemo = () => {
    setEnergy(MAX_ENERGY);
    haptic("medium");
    alert("Energjia u rikthye në maksimum (1000).");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex flex-col h-screen w-screen max-w-md mx-auto bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative shadow-2xl border border-slate-800">

      {/* HEADER */}
      <header className="px-5 pt-5 pb-3 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
            A
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wide text-white">
              {APP_NAME}
            </h1>
            <div className="flex items-center space-x-1 text-xs text-indigo-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Level: Pro Publisher</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-400">
            {dailyStreak} Ditë
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-5 py-2 z-10 pb-24">

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="flex flex-col items-center space-y-3 pt-1">
            <div className="text-center bg-slate-900/90 border border-slate-800 rounded-3xl p-4 w-full shadow-xl">
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
                Balanca Totale (Pikë)
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Coins className="w-7 h-7 text-yellow-400" />
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                  {coins.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Tërheqja Min: {MIN_WITHDRAW.toLocaleString()} Pikë
              </p>
            </div>

            <div
              key={tapAnimation}
              onClick={handleTap}
              className="relative w-40 h-40 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1.5 shadow-2xl cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                <Gamepad2 className="w-12 h-12 text-indigo-400 mb-1" />
                <span className="text-sm font-bold text-white tracking-wider">
                  KLIKO & FITO
                </span>
                <span className="text-[10px] text-indigo-300 font-medium">
                  +1 Pikë
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Minimi në Cloud
                  </h3>
                  <p className="text-[11px] text-yellow-400 font-mono">
                    Të fituara: {minedCoins.toLocaleString()} Pikë
                  </p>
                </div>
              </div>
              <button
                onClick={handleClaimMined}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md"
              >
                Mblidh
              </button>
            </div>

            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300">Energjia</span>
                </div>
                <span className="text-indigo-400 font-mono">
                  {energy} / {MAX_ENERGY}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (energy / MAX_ENERGY) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="space-y-3 pt-1">
            <h2 className="text-lg font-bold text-white mb-3">
              Detyrat & Shpërblimet
            </h2>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Plotëso Anketat (CPX Research)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Fitoni pikë të larta nga anketat
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOfferwallModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center"
              >
                Hap
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>

            {/* TELEGRAM STARS SHOP */}
            <div className="bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h3 className="text-sm font-bold text-white">
                  Dyqani i Telegram Stars
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() =>
                    handleBuyWithStarsReal("Mbushje Energjie", 50, 0)
                  }
                  className="bg-slate-900 border border-amber-500/20 p-2.5 rounded-xl text-left hover:border-amber-500/50 transition-colors"
                >
                  <div className="text-xs font-bold text-white mb-0.5">
                    ⚡ Max Energji
                  </div>
                  <div className="text-[11px] text-yellow-400 font-extrabold">
                    50 Stars ⭐
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleBuyWithStarsReal("5,000 Pikë", 100, 5000)
                  }
                  className="bg-slate-900 border border-amber-500/20 p-2.5 rounded-xl text-left hover:border-amber-500/50 transition-colors"
                >
                  <div className="text-xs font-bold text-white mb-0.5">
                    🪙 +5,000 Pikë
                  </div>
                  <div className="text-[11px] text-yellow-400 font-extrabold">
                    100 Stars ⭐
                  </div>
                </button>
              </div>
            </div>

            {/* ADSGRAM ADS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <PlaySquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Shiko Reklamën & Fito
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    +{AD_REWARD} Pikë (Adsgram)
                  </p>
                </div>
              </div>
              <button
                onClick={handleWatchAdsgram}
                disabled={isWatchingAd}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md"
              >
                {isWatchingAd ? "Po ngarkohet..." : "Shiko Reklamën (Adsgram)"}
              </button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Bonus Falas Energjie
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Rikthe energjinë menjëherë
                  </p>
                </div>
              </div>
              <button
                onClick={refillEnergyDemo}
                className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold"
              >
                Merr
              </button>
            </div>
          </div>
        )}

        {/* WITHDRAW TAB */}
        {activeTab === "withdraw" && (
          <div className="space-y-4 pt-1">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1">
                Tërheqja e Fondeve
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Kërko tërheqjen e fondeve apo pikëve të tua. Min:{" "}
                <strong>{MIN_WITHDRAW.toLocaleString()} Pikë</strong>
              </p>

              <div className="mb-4 bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                      Portofoli i Lidhur
                    </span>
                    <span className="block text-xs font-bold text-emerald-400 mt-1">
                      {connectedWallet || "Nuk është lidhur"}
                    </span>
                  </div>
                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnectingWallet || Boolean(connectedWallet)}
                    className="bg-indigo-600 disabled:opacity-60 text-white px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    {isConnectingWallet
                      ? "Duke u lidhur..."
                      : connectedWallet
                      ? "I Lidhur"
                      : "Lidh Portofolin"}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Balanca e disponueshme</span>
                  <span className="text-xs font-bold text-yellow-400">
                    {coins.toLocaleString()} Pikë
                  </span>
                </div>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-3">
                <input
                  type="number"
                  min={MIN_WITHDRAW}
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  placeholder={`Minimumi ${MIN_WITHDRAW.toLocaleString()} Pikë`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2"
                >
                  <span>
                    {isSubmittingWithdraw ? "Duke u procesuar..." : "Kërko Tërheqjen"}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FRIENDS TAB */}
        {activeTab === "friends" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5">
                Programi i Ftesave
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Fito {REFERRAL_REWARD.toLocaleString()} Pikë për çdo mik të ftuar!
              </p>
              <button
                onClick={handleCopyRef}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2"
              >
                {copiedRef ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedRef ? "Linku u kopjua!" : "Kopjo Linkun e Ftesës"}</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                User ID Yt
              </p>
              <p className="text-xs text-slate-300 font-mono break-all">
                {telegramUserId}
              </p>
            </div>
          </div>
        )}

        {/* RANKING TAB */}
        {activeTab === "ranking" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">
                Renditja Globale
              </h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-lg">👑</span>
                <div>
                  <span className="block text-xs font-bold text-white">
                    {telegramUsername}
                  </span>
                  <span className="text-[10px] text-slate-500">Llogaria Jote</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-yellow-400">
                {coins.toLocaleString()}
              </span>
            </div>

            {[
              { rank: 1, name: "Top Publisher", coins: 250000 },
              { rank: 2, name: "AdDev Player", coins: 198500 },
              { rank: 3, name: "Rewards Master", coins: 175300 },
            ].map((player) => (
              <div
                key={player.rank}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                    {player.rank}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {player.name}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-yellow-400">
                  {player.coins.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CPX MODAL */}
      {showOfferwallModal && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">CPX Research</h3>
            </div>
            <button
              onClick={() => setShowOfferwallModal(false)}
              className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
            <BarChart3 className="w-12 h-12 text-purple-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">
              Plotëso Anketat
            </h4>
            <p className="text-xs text-slate-400 mb-5">
              Plotëso anketat e disponueshme dhe fito shpërblime direkt.
            </p>
            <button
              onClick={() => {
                if (window.Telegram?.WebApp?.openLink) {
                  window.Telegram.WebApp.openLink(cpxOfferwallUrl);
                } else {
                  window.open(cpxOfferwallUrl, "_blank", "noopener,noreferrer");
                }
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2"
            >
              Hap Anketat
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav className="absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 px-2 py-1.5 z-20 flex justify-around">
        {[
          { id: "home", label: "Home", icon: Home },
          { id: "tasks", label: "Tasks", icon: CheckSquare },
          { id: "withdraw", label: "Withdraw", icon: Wallet },
          { id: "friends", label: "Friends", icon: Users },
          { id: "ranking", label: "Ranking", icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
