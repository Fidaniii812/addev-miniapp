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
  Gift,
  X,
  RefreshCw,
  Info,
  Zap,
  Clock3,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Tab = "home" | "tasks" | "withdraw" | "friends" | "ranking";

type NoticeType = "success" | "error" | "info";

interface Notice {
  type: NoticeType;
  title: string;
  message: string;
}

/* =========================================================
   CONFIG
   Nuk ka lidhje me AdDev Studio website.
========================================================= */

const ADSGRAM_BLOCK_ID = "44129";

const CPX_APP_ID = "34909";

const MIN_WITHDRAW = 75000;

const MAX_ENERGY = 1000;

const ENERGY_REGEN_MS = 1500;

const MINING_INTERVAL_MS = 2000;

const MINING_CAP = 1000;

/* =========================================================
   TELEGRAM HELPERS
========================================================= */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        openLink?: (url: string) => void;
        openInvoice?: (
          url: string,
          callback?: (status: string) => void
        ) => void;
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id?: number;
            username?: string;
            first_name?: string;
          };
        };
      };
    };

    Adsgram?: {
      init: (options: { blockId: string }) => {
        show: () => Promise<void>;
      };
    };
  }
}

/* =========================================================
   LOCAL STORAGE
========================================================= */

function getNumber(key: string, fallback: number) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  } catch {
    return fallback;
  }
}

function getString(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: string | number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Storage may be unavailable in some environments.
  }
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  /* -------------------------------------------------------
     Telegram
  ------------------------------------------------------- */

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  const telegramUserId =
    telegramUser?.id?.toString() ||
    getString("addev_user_id", "local_user");

  /* -------------------------------------------------------
     Main state
  ------------------------------------------------------- */

  const [coins, setCoins] = useState<number>(() =>
    getNumber("addev_coins", 15432)
  );

  const [energy, setEnergy] = useState<number>(() =>
    getNumber("addev_energy", 1000)
  );

  const [minedCoins, setMinedCoins] = useState<number>(() =>
    getNumber("addev_mined", 0)
  );

  const [activeTab, setActiveTab] = useState<Tab>("home");

  const [dailyStreak] = useState<number>(() =>
    getNumber("addev_streak", 6)
  );

  const [showOfferwall, setShowOfferwall] = useState(false);

  const [showInfo, setShowInfo] = useState(false);

  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const [connectedWallet, setConnectedWallet] = useState(() =>
    getString("addev_wallet", "")
  );

  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [isSubmittingWithdraw, setIsSubmittingWithdraw] =
    useState(false);

  const [copiedRef, setCopiedRef] = useState(false);

  const [notice, setNotice] = useState<Notice | null>(null);

  const [tapAnimation, setTapAnimation] = useState<number | null>(null);

  /* -------------------------------------------------------
     Stable referral link
  ------------------------------------------------------- */

  const referralLink = useMemo(() => {
    const existing = getString("addev_referral", "");

    if (existing) {
      return existing;
    }

    const newLink =
      "https://t.me/AdDevRewardsBot?start=ref_" + telegramUserId;

    save("addev_referral", newLink);

    return newLink;
  }, [telegramUserId]);

  /* -------------------------------------------------------
     CPX URL
  ------------------------------------------------------- */

  const cpxOfferwallUrl =
    `https://offers.cpx-research.com/index.php` +
    `?app_id=${CPX_APP_ID}` +
    `&ext_user_id=${encodeURIComponent(telegramUserId)}`;

  /* =======================================================
     NOTICE
  ======================================================= */

  const showNotice = (
    type: NoticeType,
    title: string,
    message: string
  ) => {
    setNotice({
      type,
      title,
      message,
    });

    window.setTimeout(() => {
      setNotice(null);
    }, 3500);
  };

  /* =======================================================
     TELEGRAM INITIALIZATION
  ======================================================= */

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready?.();
      tg.expand?.();
    }

    save("addev_user_id", telegramUserId);
  }, [telegramUserId]);

  /* =======================================================
     SAVE COINS
  ======================================================= */

  useEffect(() => {
    save("addev_coins", coins);
  }, [coins]);

  /* =======================================================
     SAVE ENERGY
  ======================================================= */

  useEffect(() => {
    save("addev_energy", energy);
  }, [energy]);

  /* =======================================================
     SAVE MINING
  ======================================================= */

  useEffect(() => {
    save("addev_mined", minedCoins);
  }, [minedCoins]);

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

    return () => window.clearInterval(timer);
  }, []);

  /* =======================================================
     CLOUD MINING
  ======================================================= */

  useEffect(() => {
    const miningTimer = window.setInterval(() => {
      setMinedCoins((previous) => {
        if (previous >= MINING_CAP) {
          return previous;
        }

        return previous + 1;
      });
    }, MINING_INTERVAL_MS);

    return () => window.clearInterval(miningTimer);
  }, []);

  /* =======================================================
     TAP / PLAY
  ======================================================= */

  const handleTap = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (energy <= 0) {
      showNotice(
        "info",
        "Energy empty",
        "Wait a little while for your energy to regenerate."
      );

      return;
    }

    setCoins((previous) => previous + 1);

    setEnergy((previous) =>
      Math.max(previous - 1, 0)
    );

    const id = Date.now();

    setTapAnimation(id);

    window.setTimeout(() => {
      setTapAnimation(null);
    }, 500);
  };

  /* =======================================================
     ADSGRAM
  ======================================================= */

  const handleWatchAdsgram = async () => {
    if (isWatchingAd) {
      return;
    }

    const adsgram = window.Adsgram;

    if (!adsgram) {
      showNotice(
        "error",
        "Ads unavailable",
        "Adsgram is not available. Open the Mini App inside Telegram."
      );

      return;
    }

    setIsWatchingAd(true);

    try {
      const controller = adsgram.init({
        blockId: ADSGRAM_BLOCK_ID,
      });

      await controller.show();

      /*
       * Reward ONLY after the ad promise succeeds.
       */

      setCoins((previous) => previous + 250);

      showNotice(
        "success",
        "Reward received",
        "+250 AdCoins have been added to your balance."
      );
    } catch (error) {
      console.log("Adsgram error:", error);

      showNotice(
        "error",
        "Ad unavailable",
        "The advertisement was skipped, closed, or the Adsgram block is not active."
      );
    } finally {
      setIsWatchingAd(false);
    }
  };

  /* =======================================================
     CLAIM MINING
  ======================================================= */

  const handleClaimMined = () => {
    if (minedCoins <= 0) {
      showNotice(
        "info",
        "Nothing to claim",
        "Cloud Mining has not generated any new AdCoins yet."
      );

      return;
    }

    const amount = minedCoins;

    setCoins((previous) => previous + amount);

    setMinedCoins(0);

    showNotice(
      "success",
      "Mining claimed",
      `+${amount.toLocaleString()} AdCoins added to your balance.`
    );
  };

  /* =======================================================
     ENERGY BONUS
  ======================================================= */

  const handleEnergyBonus = () => {
    if (energy >= MAX_ENERGY) {
      showNotice(
        "info",
        "Energy already full",
        "Your energy is already at 1000 / 1000."
      );

      return;
    }

    setEnergy(MAX_ENERGY);

    showNotice(
      "success",
      "Energy restored",
      "Your energy has been restored to 1000."
    );
  };

  /* =======================================================
     TELEGRAM STARS
     
     Real Telegram Stars purchases require an invoice
     generated by the Telegram Bot/backend.
  ======================================================= */

  const handleBuyWithStars = (
    packageName: string,
    starCost: number
  ) => {
    /*
     * Front-end only version.
     *
     * Do NOT pretend that this is a real payment.
     * A real invoice URL must be generated by the bot/backend.
     */

    showNotice(
      "info",
      "Telegram Stars",
      `${packageName} costs ${starCost} Stars. A real purchase invoice must be supplied by the Telegram bot.`
    );
  };

  /* =======================================================
     WALLET
     
     This does NOT fake a real blockchain connection.
  ======================================================= */

  const handleConnectWallet = () => {
    if (connectedWallet) {
      showNotice(
        "info",
        "Wallet connected",
        connectedWallet
      );

      return;
    }

    /*
     * Placeholder connection state.
     *
     * Real TON Connect should be added separately.
     */

    const demoWallet = "TON Wallet";

    setConnectedWallet(demoWallet);

    save("addev_wallet", demoWallet);

    showNotice(
      "info",
      "Wallet ready",
      "TON Connect should be used here for a real wallet connection."
    );
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
      showNotice(
        "error",
        "Wallet required",
        "Connect your TON wallet before requesting a withdrawal."
      );

      return;
    }

    if (!Number.isFinite(amount)) {
      showNotice(
        "error",
        "Invalid amount",
        "Enter a valid AdCoins amount."
      );

      return;
    }

    if (amount < MIN_WITHDRAW) {
      showNotice(
        "error",
        "Minimum payout",
        `You need at least ${MIN_WITHDRAW.toLocaleString()} AdCoins.`
      );

      return;
    }

    if (amount > coins) {
      showNotice(
        "error",
        "Insufficient balance",
        "You do not have enough AdCoins for this withdrawal."
      );

      return;
    }

    setIsSubmittingWithdraw(true);

    /*
     * Front-end simulation only.
     *
     * Real withdrawal must be validated server-side.
     */

    window.setTimeout(() => {
      setCoins((previous) =>
        Math.max(previous - amount, 0)
      );

      setWithdrawAmount("");

      setIsSubmittingWithdraw(false);

      showNotice(
        "success",
        "Request created",
        `Withdrawal request for ${amount.toLocaleString()} AdCoins was created locally.`
      );
    }, 900);
  };

  /* =======================================================
     COPY REFERRAL
  ======================================================= */

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(
        referralLink
      );

      setCopiedRef(true);

      window.setTimeout(() => {
        setCopiedRef(false);
      }, 2000);

      showNotice(
        "success",
        "Referral copied",
        "Your referral link has been copied."
      );
    } catch {
      showNotice(
        "error",
        "Copy failed",
        "Telegram/browser did not allow copying the link."
      );
    }
  };

  /* =======================================================
     OPEN CPX
  ======================================================= */

  const openCPX = () => {
    const tg = window.Telegram?.WebApp;

    if (tg?.openLink) {
      tg.openLink(cpxOfferwallUrl);
      return;
    }

    window.open(
      cpxOfferwallUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "home",
      label: "Home",
      icon: Home,
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
    },
    {
      id: "withdraw",
      label: "Withdraw",
      icon: Wallet,
    },
    {
      id: "friends",
      label: "Friends",
      icon: Users,
    },
    {
      id: "ranking",
      label: "Ranking",
      icon: Trophy,
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 select-none overflow-hidden">
      <div className="relative flex flex-col h-screen w-full max-w-md mx-auto bg-slate-950 border-x border-slate-900 shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
              A
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-wide">
                AdDev Rewards
              </h1>

              <div className="flex items-center gap-1 text-xs text-indigo-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />

                <span>
                  Level: Pro Publisher
                </span>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => setShowInfo(true)}
              className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center"
            >
              <Info className="w-4 h-4 text-slate-400" />
            </button>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />

              <span className="text-xs font-bold text-orange-400">
                {dailyStreak} Days
              </span>
            </div>

          </div>

        </header>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="flex-1 overflow-y-auto px-5 pt-1 pb-24">

          {/* =================================================
              HOME
          ================================================= */}

          {activeTab === "home" && (
            <div className="space-y-3">

              {/* Balance */}

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center shadow-xl">

                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                  Total AdCoins
                </p>

                <div className="flex items-center justify-center gap-2 mt-1">

                  <Coins className="w-7 h-7 text-yellow-400" />

                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                    {coins.toLocaleString()}
                  </span>

                </div>

                <p className="text-[10px] text-slate-400 mt-1">
                  Minimum payout:{" "}
                  {MIN_WITHDRAW.toLocaleString()} AdCoins
                </p>

              </div>

              {/* Tap */}

              <div className="flex justify-center py-2">

                <div
                  onClick={handleTap}
                  className="relative w-44 h-44 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1.5 shadow-2xl cursor-pointer active:scale-95 transition-transform"
                >

                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">

                    <Gamepad2 className="w-12 h-12 text-indigo-400 mb-1" />

                    <span className="text-sm font-bold tracking-wider">
                      TAP / PLAY
                    </span>

                    <span className="text-[10px] text-indigo-300">
                      +1 AdCoin
                    </span>

                    {tapAnimation && (
                      <span className="absolute top-5 text-yellow-400 font-black text-xl animate-bounce">
                        +1
                      </span>
                    )}

                  </div>

                </div>

              </div>

              {/* Mining */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Cpu
                      className="w-5 h-5 text-amber-400 animate-spin"
                      style={{
                        animationDuration: "4s",
                      }}
                    />
                  </div>

                  <div>

                    <h3 className="text-xs font-bold">
                      Cloud Mining
                    </h3>

                    <p className="text-[11px] text-yellow-400 font-mono">
                      Mined:{" "}
                      {minedCoins.toLocaleString()} AdCoins
                    </p>

                  </div>

                </div>

                <button
                  onClick={handleClaimMined}
                  className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Claim
                </button>

              </div>

              {/* Energy */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">

                <div className="flex justify-between text-xs font-semibold mb-2">

                  <span className="text-slate-300">
                    Energy
                  </span>

                  <span className="text-indigo-400 font-mono">
                    {energy} / {MAX_ENERGY}
                  </span>

                </div>

                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all"
                    style={{
                      width: `${(energy / MAX_ENERGY) * 100}%`,
                    }}
                  />

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              TASKS
          ================================================= */}

          {activeTab === "tasks" && (
            <div className="space-y-3">

              <h2 className="text-lg font-bold">
                Tasks & Monetization
              </h2>

              {/* CPX */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    📊
                  </div>

                  <div>
                    <h3 className="text-xs font-bold">
                      CPX Research Offerwall
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      High paying surveys
                    </p>
                  </div>

                </div>

                <button
                  onClick={openCPX}
                  className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  Open
                  <ExternalLink className="w-3 h-3" />
                </button>

              </div>

              {/* Stars */}

              <div className="bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/30 rounded-2xl p-4">

                <div className="flex items-center gap-2 mb-3">

                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />

                  <h3 className="text-sm font-bold">
                    Telegram Stars Shop
                  </h3>

                </div>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    onClick={() =>
                      handleBuyWithStars(
                        "Max Energy",
                        50
                      )
                    }
                    className="bg-slate-900 border border-amber-500/20 p-3 rounded-xl text-left"
                  >

                    <div className="text-xs font-bold">
                      ⚡ Max Energy
                    </div>

                    <div className="text-[11px] text-yellow-400 font-bold mt-1">
                      50 Stars ⭐
                    </div>

                  </button>

                  <button
                    onClick={() =>
                      handleBuyWithStars(
                        "5,000 AdCoins",
                        100
                      )
                    }
                    className="bg-slate-900 border border-amber-500/20 p-3 rounded-xl text-left"
                  >

                    <div className="text-xs font-bold">
                      🪙 +5,000 AdCoins
                    </div>

                    <div className="text-[11px] text-yellow-400 font-bold mt-1">
                      100 Stars ⭐
                    </div>

                  </button>

                </div>

              </div>

              {/* Adsgram */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <PlaySquare className="w-5 h-5 text-cyan-400" />
                  </div>

                  <div>

                    <h3 className="text-xs font-bold">
                      Watch Sponsored Ad
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      +250 AdCoins
                    </p>

                  </div>

                </div>

                <button
                  onClick={handleWatchAdsgram}
                  disabled={isWatchingAd}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  {isWatchingAd
                    ? "Loading..."
                    : "Watch"}
                </button>

              </div>

              {/* Energy Bonus */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-yellow-400" />
                  </div>

                  <div>

                    <h3 className="text-xs font-bold">
                      Energy Bonus
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Restore your energy
                    </p>

                  </div>

                </div>

                <button
                  onClick={handleEnergyBonus}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Refill
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              WITHDRAW
          ================================================= */}

          {activeTab === "withdraw" && (
            <div className="space-y-4">

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">

                <h2 className="text-lg font-bold">
                  Withdraw Funds
                </h2>

                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Minimum payout:{" "}
                  <strong className="text-slate-200">
                    {MIN_WITHDRAW.toLocaleString()} AdCoins
                  </strong>
                </p>

                {/* Wallet */}

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between mb-4">

                  <div className="min-w-0">

                    <span className="block text-[10px] text-slate-500 uppercase">
                      TON Wallet
                    </span>

                    <span className="block text-xs font-bold text-emerald-400 truncate">
                      {connectedWallet ||
                        "Not Connected"}
                    </span>

                  </div>

                  <button
                    onClick={handleConnectWallet}
                    className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    {connectedWallet
                      ? "Connected"
                      : "Connect"}
                  </button>

                </div>

                {/* Balance */}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3">

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-400">
                      Available
                    </span>

                    <span className="text-yellow-400 font-bold">
                      {coins.toLocaleString()} AdCoins
                    </span>

                  </div>

                </div>

                <form
                  onSubmit={handleWithdraw}
                  className="space-y-3"
                >

                  <input
                    type="number"
                    min={MIN_WITHDRAW}
                    value={withdrawAmount}
                    onChange={(event) =>
                      setWithdrawAmount(
                        event.target.value
                      )
                    }
                    placeholder="Enter AdCoins amount"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingWithdraw}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >

                    {isSubmittingWithdraw ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Request Withdrawal
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}

                  </button>

                </form>

              </div>

            </div>
          )}

          {/* =================================================
              FRIENDS
          ================================================= */}

          {activeTab === "friends" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center">

              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-indigo-400" />
              </div>

              <h2 className="text-lg font-bold">
                Referral Program
              </h2>

              <p className="text-xs text-slate-400 mt-2 mb-5">
                Earn 1,000 AdCoins for every
                invited friend.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3">

                <p className="text-[10px] text-slate-500 mb-1">
                  YOUR REFERRAL LINK
                </p>

                <p className="text-[10px] text-indigo-300 break-all">
                  {referralLink}
                </p>

              </div>

              <button
                onClick={handleCopyRef}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
              >

                {copiedRef ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}

                {copiedRef
                  ? "Copied!"
                  : "Copy Referral Link"}

              </button>

            </div>
          )}

          {/* =================================================
              RANKING
          ================================================= */}

          {activeTab === "ranking" && (
            <div className="space-y-3">

              <h2 className="text-lg font-bold">
                Global Leaderboard
              </h2>

              {[
                {
                  name: "Fidan Beciri",
                  coins: 145200,
                },
                {
                  name: "Reward Hunter",
                  coins: 128450,
                },
                {
                  name: "AdMaster",
                  coins: 113900,
                },
                {
                  name: "Coin Player",
                  coins: 98400,
                },
              ].map((player, index) => (

                <div
                  key={player.name}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-black text-indigo-400">
                      #{index + 1}
                    </div>

                    <span className="text-xs font-bold">
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

        {/* =================================================
            BOTTOM NAV
        ================================================= */}

        <nav className="absolute bottom-0 left-0 right-0 bg-slate-900/98 border-t border-slate-800 px-2 py-2 flex justify-around z-30">

          {tabs.map((tab) => {

            const Icon = tab.icon;

            const active =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition ${
                  active
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-slate-500"
                }`}
              >

                <Icon className="w-5 h-5" />

                <span className="text-[10px] font-semibold mt-1">
                  {tab.label}
                </span>

              </button>
            );
          })}

        </nav>

        {/* =================================================
            NOTICE / TOAST
        ================================================= */}

        {notice && (
          <div className="absolute top-4 left-4 right-4 z-[100]">

            <div
              className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
                notice.type === "success"
                  ? "bg-emerald-950/95 border-emerald-700"
                  : notice.type === "error"
                  ? "bg-red-950/95 border-red-700"
                  : "bg-slate-900/95 border-slate-700"
              }`}
            >

              <div className="flex items-start gap-3">

                <div className="flex-1">

                  <h3 className="text-sm font-bold">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1">
                    {notice.message}
                  </p>

                </div>

                <button
                  onClick={() => setNotice(null)}
                  className="text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            INFO MODAL
        ================================================= */}

        {showInfo && (
          <div className="absolute inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">

            <div className="w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl">

              <div className="flex justify-between items-center mb-4">

                <h2 className="text-lg font-bold">
                  About AdDev Rewards
                </h2>

                <button
                  onClick={() => setShowInfo(false)}
                  className="text-slate-400"
                >
                  <X />
                </button>

              </div>

              <div className="space-y-3 text-xs text-slate-400">

                <p>
                  AdDev Rewards is a Telegram Mini App
                  where users can earn AdCoins through
                  activities, advertisements and referrals.
                </p>

                <div className="bg-slate-950 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Energy regenerates automatically.
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock3 className="w-4 h-4 text-indigo-400" />
                    Cloud Mining generates AdCoins over time.
                  </div>
                </div>

                <p className="text-yellow-400/80">
                  Real withdrawals, real referrals and
                  real payment verification require a
                  secure backend/bot.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            CPX MODAL
        ================================================= */}

        {showOfferwall && (
          <div className="absolute inset-0 z-[80] bg-slate-950 flex flex-col p-5">

            <div className="flex items-center justify-between mb-4">

              <h2 className="font-bold">
                CPX Research
              </h2>

              <button
                onClick={() =>
                  setShowOfferwall(false)
                }
                className="text-slate-400"
              >
                <X />
              </button>

            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center">

              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                📊
              </div>

              <h3 className="font-bold mb-2">
                CPX Research Offerwall
              </h3>

              <p className="text-xs text-slate-400 mb-5">
                Complete available surveys and
                eligible offers.
              </p>

              <button
                onClick={openCPX}
                className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                Open Offerwall
                <ExternalLink className="w-4 h-4" />
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
