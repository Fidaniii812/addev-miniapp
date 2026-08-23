import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  History,
  Loader2,
  X,
} from "lucide-react";

import { createClient } from "@supabase/supabase-js";

/*
===========================================================
                 ADDDEV REWARDS
                 Telegram Mini App
===========================================================

This App.tsx is prepared for:

1. Telegram Mini App
2. Supabase
3. Telegram Stars
4. CPX Research
5. Adsgram
6. Referral system
7. Cloud mining
8. Withdrawals
9. Leaderboard
10. Transaction history

IMPORTANT:

Telegram Stars:
The frontend DOES NOT create fake invoices.

It calls a Supabase Edge Function:

create-stars-invoice

The backend must create the real Telegram Stars invoice.

Recommended Supabase tables:

profiles
transactions
withdrawals
referrals

Recommended RPC/functions:

tap_adcoin
claim_mining
apply_referral

===========================================================
*/


/* =========================================================
   TYPES
========================================================= */

type Tab =
  | "home"
  | "tasks"
  | "withdraw"
  | "friends"
  | "ranking";

type NoticeType =
  | "success"
  | "error"
  | "info";

type Notice = {
  title: string;
  message: string;
  type: NoticeType;
};

type Profile = {
  telegram_id: number;
  first_name?: string | null;
  username?: string | null;

  coins: number;
  energy: number;
  mined_coins: number;

  streak: number;

  wallet_address: string | null;

  referral_code: string | null;
  referred_by: number | null;
};

type Withdrawal = {
  id: string;
  amount: number;
  wallet_address: string;
  status: string;
  created_at: string;
};

type LeaderboardUser = {
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  coins: number;
};


/* =========================================================
   TELEGRAM TYPES
========================================================= */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        expand?: () => void;
        close?: () => void;

        openInvoice?: (
          url: string,
          callback?: (status: string) => void
        ) => void;

        initData?: string;

        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };

          start_param?: string;
        };

        HapticFeedback?: {
          impactOccurred?: (
            style: "light" | "medium" | "heavy"
          ) => void;

          notificationOccurred?: (
            type: "error" | "success" | "warning"
          ) => void;
        };
      };
    };

    Adsgram?: {
      init: (
        config: {
          blockId: string;
        }
      ) => {
        show: () => Promise<unknown>;
      };
    };
  }
}


/* =========================================================
   CONFIGURATION
========================================================= */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL as string | undefined;

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;


/*
   Supabase is optional during initial UI testing.

   Once VITE variables are added,
   the app automatically connects.
*/

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      )
    : null;


/* =========================================================
   APP CONFIG
========================================================= */

const BOT_USERNAME =
  "AdDevRewardsBot";

const ADSGRAM_BLOCK_ID =
  "44129";

const CPX_APP_ID =
  "34909";

const MAX_ENERGY =
  1000;

const MIN_WITHDRAWAL =
  75000;


/*
   IMPORTANT:

   These are only frontend identifiers.

   Real Stars invoices MUST be generated
   by Supabase Edge Function.
*/

const STARS_FUNCTION =
  "create-stars-invoice";


/* =========================================================
   TELEGRAM HELPERS
========================================================= */

function getTelegramUser() {
  return (
    window.Telegram?.WebApp?.initDataUnsafe?.user ||
    null
  );
}


function getTelegramUserId(): number | null {
  return (
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id ??
    null
  );
}


function getStartParam(): string | null {
  return (
    window.Telegram?.WebApp?.initDataUnsafe?.start_param ??
    null
  );
}


/* =========================================================
   FORMATTERS
========================================================= */

function formatCoins(
  value: number
) {
  return Math.max(
    0,
    Math.floor(value)
  ).toLocaleString();
}


function formatDate(
  value: string
) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}


/* =========================================================
   MAIN APP
========================================================= */

export default function App() {

  /* -------------------------------------------------------
     TELEGRAM INITIALIZATION
  ------------------------------------------------------- */

  useEffect(() => {

    const tg =
      window.Telegram?.WebApp;

    if (!tg) return;

    tg.ready?.();
    tg.expand?.();

  }, []);


  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [activeTab, setActiveTab] =
    useState<Tab>("home");

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [isWatchingAd, setIsWatchingAd] =
    useState(false);

  const [showOfferwall, setShowOfferwall] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const [notice, setNotice] =
    useState<Notice | null>(null);

  const [withdrawAmount, setWithdrawAmount] =
    useState("");

  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>([]);

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardUser[]>([]);

  const [copiedRef, setCopiedRef] =
    useState(false);

  /*
     Local mining timer.

     Later this should be moved completely
     to Supabase/server logic.
  */

  const [localMining, setLocalMining] =
    useState(0);


  /* -------------------------------------------------------
     TELEGRAM USER
  ------------------------------------------------------- */

  const telegramUser =
    getTelegramUser();

  const telegramUserId =
    getTelegramUserId();

  const userId =
    telegramUserId ?? 0;


  /* -------------------------------------------------------
     REFERRAL
  ------------------------------------------------------- */

  const referralCode =
    useMemo(() => {

      if (!userId)
        return "";

      return `ref_${userId}`;

    }, [userId]);


  /*
     Telegram Mini App referral:

     https://t.me/AdDevRewardsBot?startapp=ref_123456

  */

  const referralLink =
    useMemo(() => {

      if (!userId)
        return "";

      return `https://t.me/${BOT_USERNAME}?startapp=${referralCode}`;

    }, [
      userId,
      referralCode,
    ]);


  /* -------------------------------------------------------
     CPX OFFERWALL
  ------------------------------------------------------- */

  const cpxUserId =
    userId
      ? String(userId)
      : "demo_user";


  const cpxOfferwallUrl =
    `https://offers.cpx-research.com/index.php?app_id=${CPX_APP_ID}&ext_user_id=${encodeURIComponent(
      cpxUserId
    )}`;


  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const showNotice =
    useCallback(
      (
        title: string,
        message: string,
        type: NoticeType = "info"
      ) => {

        setNotice({
          title,
          message,
          type,
        });

      },
      []
    );


  const haptic =
    useCallback(
      (
        style:
          | "light"
          | "medium"
          | "heavy" = "light"
      ) => {

        window.Telegram?.WebApp
          ?.HapticFeedback
          ?.impactOccurred?.(
            style
          );

      },
      []
    );


  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile =
    useCallback(async () => {

      /*
         If Supabase isn't connected,
         use demo profile.

         This lets us test the UI first.
      */

      if (!supabase || !userId) {

        setProfile({

          telegram_id:
            userId || 123456789,

          first_name:
            telegramUser?.first_name ||
            "Fidan",

          username:
            telegramUser?.username ||
            null,

          coins:
            15262,

          energy:
            988,

          mined_coins:
            0,

          streak:
            6,

          wallet_address:
            null,

          referral_code:
            referralCode,

          referred_by:
            null,

        });

        setLoading(false);

        return;
      }


      try {

        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .select(`
            telegram_id,
            first_name,
            username,
            coins,
            energy,
            mined_coins,
            streak,
            wallet_address,
            referral_code,
            referred_by
          `)
          .eq(
            "telegram_id",
            userId
          )
          .maybeSingle();


        if (error)
          throw error;


        /*
           Create profile if user doesn't exist.
        */

        if (!data) {

          const newProfile = {

            telegram_id:
              userId,

            first_name:
              telegramUser?.first_name ||
              null,

            username:
              telegramUser?.username ||
              null,

            coins:
              0,

            energy:
              MAX_ENERGY,

            mined_coins:
              0,

            streak:
              1,

            wallet_address:
              null,

            referral_code:
              referralCode,

            referred_by:
              null,

          };


          const {
            data: created,
            error: createError,
          } =
            await supabase
              .from("profiles")
              .insert(newProfile)
              .select()
              .single();


          if (createError)
            throw createError;


          setProfile(created);

        } else {

          setProfile(data);

        }

      } catch (error) {

        console.error(
          "Profile error:",
          error
        );

        showNotice(
          "Supabase",
          "Nuk mund të ngarkohej profili.",
          "error"
        );

      } finally {

        setLoading(false);

      }

    }, [
      userId,
      referralCode,
      telegramUser,
      showNotice,
    ]);


  useEffect(() => {

    loadProfile();

  }, [loadProfile]);


  /* =======================================================
     ENERGY REGENERATION
  ======================================================= */

  useEffect(() => {

    const timer =
      setInterval(() => {

        setProfile(
          previous => {

            if (!previous)
              return previous;

            if (
              previous.energy >=
              MAX_ENERGY
            )
              return previous;

            return {
              ...previous,
              energy:
                previous.energy + 1,
            };

          }
        );

      }, 1500);


    return () =>
      clearInterval(timer);

  }, []);


  /* =======================================================
     LOCAL MINING DISPLAY
  ======================================================= */

  useEffect(() => {

    const timer =
      setInterval(() => {

        setLocalMining(
          previous =>
            previous + 1
        );

      }, 2000);


    return () =>
      clearInterval(timer);

  }, []);


  /* =======================================================
     TAP / PLAY
  ======================================================= */

  const handleTap =
    async () => {

      if (!profile)
        return;


      if (profile.energy <= 0) {

        showNotice(
          "Energy",
          "Nuk ke më energji. Përdor Energy Refill.",
          "info"
        );

        return;
      }


      haptic("light");


      /*
         Local update for immediate UI.

         Later this should use a secure
         Supabase RPC:

         tap_adcoin
      */

      setProfile({
        ...profile,

        coins:
          profile.coins + 1,

        energy:
          profile.energy - 1,
      });


      /*
         If Supabase is connected,
         try secure RPC.
      */

      if (supabase && userId) {

        const {
          error,
        } = await supabase.rpc(
          "tap_adcoin",
          {
            p_telegram_id:
              userId,
          }
        );


        if (error) {

          console.warn(
            "tap_adcoin RPC not available:",
            error.message
          );

        }

      }

    };


  /* =======================================================
     CLAIM MINING
  ======================================================= */

  const handleClaimMining =
    async () => {

      if (!profile)
        return;


      if (localMining <= 0) {

        showNotice(
          "Cloud Mining",
          "Nuk ka ende AdCoins për të marrë.",
          "info"
        );

        return;
      }


      haptic("medium");


      const amount =
        localMining;


      /*
         Immediate UI.

         Real implementation should
         call secure Supabase RPC.
      */

      setProfile({

        ...profile,

        coins:
          profile.coins + amount,

      });


      setLocalMining(0);


      if (
        supabase &&
        userId
      ) {

        const {
          error,
        } = await supabase.rpc(
          "claim_mining",
          {
            p_telegram_id:
              userId,
          }
        );


        if (error) {

          console.warn(
            "claim_mining RPC:",
            error.message
          );

        }

      }


      showNotice(
        "Cloud Mining",
        `+${formatCoins(amount)} AdCoins u morën me sukses.`,
        "success"
      );

    };


  /* =======================================================
     ADSGRAM
  ======================================================= */

  const handleWatchAdsgram =
    async () => {

      if (isWatchingAd)
        return;


      const Adsgram =
        window.Adsgram;


      if (!Adsgram) {

        showNotice(
          "Adsgram",
          "Adsgram është i disponueshëm vetëm kur Mini App hapet në Telegram.",
          "error"
        );

        return;
      }


      setIsWatchingAd(true);


      try {

        const controller =
          Adsgram.init({
            blockId:
              ADSGRAM_BLOCK_ID,
          });


        await controller.show();


        /*
           VERY IMPORTANT:

           Do NOT trust the frontend
           to award coins.

           Real reward should be confirmed
           by Adsgram/backend.

           For now we only show success.
        */

        haptic("success" as any);


        showNotice(
          "Ad completed",
          "Reklama u përfundua. Shpërblimi duhet të konfirmohet nga serveri.",
          "info"
        );


      } catch (error) {

        console.error(
          "Adsgram error:",
          error
        );


        showNotice(
          "Adsgram",
          "Reklama nuk është aktive ose aktualisht nuk ka reklamë të disponueshme.",
          "error"
        );


      } finally {

        setIsWatchingAd(false);

      }

    };


  /* =======================================================
     TELEGRAM STARS
  ======================================================= */

  const buyWithStars =
    async (
      product:
        | "energy"
        | "coins"
    ) => {

      if (!userId) {

        showNotice(
          "Telegram",
          "Hape aplikacionin brenda Telegram për të përdorur Stars.",
          "error"
        );

        return;
      }


      setActionLoading(true);


      try {

        /*
           REAL PAYMENT:

           Supabase Edge Function:
           create-stars-invoice

           Backend receives:

           telegram_id
           product

           and creates Telegram Stars invoice.
        */

        if (!supabase) {

          showNotice(
            "Stars",
            "Supabase nuk është lidhur ende. Shto VITE_SUPABASE_URL dhe VITE_SUPABASE_ANON_KEY.",
            "error"
          );

          return;

        }


        const {
          data,
          error,
        } =
          await supabase.functions.invoke(
            STARS_FUNCTION,
            {
              body: {
                telegram_id:
                  userId,

                product,
              },
            }
          );


        if (error)
          throw error;


        if (
          !data?.invoice_url
        ) {

          throw new Error(
            "Backend nuk ktheu invoice_url."
          );

        }


        const openInvoice =
          window.Telegram?.WebApp
            ?.openInvoice;


        if (!openInvoice) {

          showNotice(
            "Telegram Stars",
            "Telegram WebApp invoice nuk është i disponueshëm.",
            "error"
          );

          return;
        }


        openInvoice(
          data.invoice_url,
          async (
            status
          ) => {

            console.log(
              "Telegram Stars status:",
              status
            );


            if (
              status ===
              "paid"
            ) {

              haptic(
                "medium"
              );


              /*
                 IMPORTANT:

                 Backend should update
                 the balance after Telegram
                 confirms the payment.

                 We reload the profile.
              */

              await loadProfile();


              showNotice(
                "Payment successful",
                "Pagesa me Telegram Stars u krye me sukses.",
                "success"
              );

            }


            if (
              status ===
              "cancelled"
            ) {

              showNotice(
                "Payment cancelled",
                "Pagesa u anulua.",
                "info"
              );

            }


            if (
              status ===
              "failed"
            ) {

              showNotice(
                "Payment failed",
                "Pagesa nuk u krye.",
                "error"
              );

            }

          }
        );

      } catch (error) {

        console.error(
          "Stars payment:",
          error
        );


        showNotice(
          "Telegram Stars",
          "Nuk u krijua invoice-i. Kontrollo Supabase Edge Function.",
          "error"
        );

      } finally {

        setActionLoading(false);

      }

    };


  /* =======================================================
     COPY REFERRAL
  ======================================================= */

  const handleCopyReferral =
    async () => {

      if (!referralLink) {

        showNotice(
          "Referral",
          "Referral link nuk është ende i disponueshëm.",
          "error"
        );

        return;

      }


      try {

        await navigator.clipboard.writeText(
          referralLink
        );

        setCopiedRef(true);

        haptic("light");


        setTimeout(() => {

          setCopiedRef(false);

        }, 2000);


      } catch {

        showNotice(
          "Referral",
          referralLink,
          "info"
        );

      }

    };


  /* =======================================================
     WALLET
  ======================================================= */

  const handleConnectWallet =
    () => {

      /*
         This is intentionally NOT a fake wallet address.

         Later integrate TON Connect.

         Example:

         @tonconnect/ui-react
      */

      showNotice(
        "TON Wallet",
        "TON Connect do të lidhet në hapin e wallet integration. Nuk po përdorim wallet adresë false.",
        "info"
      );

    };


  /* =======================================================
     WITHDRAW
  ======================================================= */

  const handleWithdraw =
    async (
      event:
        React.FormEvent
    ) => {

      event.preventDefault();


      if (!profile)
        return;


      const amount =
        Number(
          withdrawAmount
        );


      if (
        !profile.wallet_address
      ) {

        showNotice(
          "Wallet",
          "Së pari duhet të lidhësh TON Wallet.",
          "error"
        );

        return;

      }


      if (
        !Number.isFinite(
          amount
        ) ||
        amount < MIN_WITHDRAWAL
      ) {

        showNotice(
          "Withdrawal",
          `Minimumi është ${formatCoins(
            MIN_WITHDRAWAL
          )} AdCoins.`,
          "error"
        );

        return;

      }


      if (
        amount >
        profile.coins
      ) {

        showNotice(
          "Withdrawal",
          "Nuk ke mjaftueshëm AdCoins.",
          "error"
        );

        return;

      }


      if (!supabase) {

        showNotice(
          "Supabase",
          "Lidh Supabase për të dërguar withdrawal request.",
          "error"
        );

        return;

      }


      setActionLoading(true);


      try {

        const {
          error,
        } =
          await supabase
            .from(
              "withdrawals"
            )
            .insert({

              telegram_id:
                userId,

              wallet_address:
                profile.wallet_address,

              amount,

              status:
                "pending",

            });


        if (error)
          throw error;


        setWithdrawAmount("");


        showNotice(
          "Withdrawal",
          "Kërkesa u dërgua me sukses dhe është në pritje të kontrollit.",
          "success"
        );


        await loadWithdrawals();


      } catch (error) {

        console.error(
          error
        );


        showNotice(
          "Withdrawal",
          "Nuk u dërgua kërkesa.",
          "error"
        );

      } finally {

        setActionLoading(false);

      }

    };


  /* =======================================================
     LOAD WITHDRAWALS
  ======================================================= */

  const loadWithdrawals =
    useCallback(async () => {

      if (
        !supabase ||
        !userId
      )
        return;


      const {
        data,
        error,
      } =
        await supabase
          .from(
            "withdrawals"
          )
          .select(
            "id,amount,wallet_address,status,created_at"
          )
          .eq(
            "telegram_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          )
          .limit(20);


      if (
        !error &&
        data
      ) {

        setWithdrawals(
          data
        );

      }

    }, [userId]);


  useEffect(() => {

    if (
      activeTab ===
      "withdraw"
    ) {

      loadWithdrawals();

    }

  }, [
    activeTab,
    loadWithdrawals,
  ]);


  /* =======================================================
     LEADERBOARD
  ======================================================= */

  const loadLeaderboard =
    useCallback(async () => {

      if (!supabase)
        return;


      const {
        data,
        error,
      } =
        await supabase
          .from(
            "profiles"
          )
          .select(
            "telegram_id,first_name,username,coins"
          )
          .order(
            "coins",
            {
              ascending:
                false,
            }
          )
          .limit(20);


      if (
        !error &&
        data
      ) {

        setLeaderboard(
          data
        );

      }

    }, []);


  useEffect(() => {

    if (
      activeTab ===
      "ranking"
    ) {

      loadLeaderboard();

    }

  }, [
    activeTab,
    loadLeaderboard,
  ]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-slate-950
        text-white
        flex
        items-center
        justify-center
      ">

        <div className="
          flex
          flex-col
          items-center
          gap-3
        ">

          <div className="
            w-14
            h-14
            rounded-2xl
            bg-gradient-to-br
            from-indigo-500
            to-purple-600
            flex
            items-center
            justify-center
          ">

            <Coins className="
              w-7
              h-7
              text-yellow-300
            " />

          </div>


          <Loader2 className="
            w-5
            h-5
            animate-spin
            text-indigo-400
          " />


          <span className="
            text-xs
            text-slate-400
          ">

            Loading AdDev Rewards...

          </span>

        </div>

      </div>

    );

  }


  /* =======================================================
     SAFE PROFILE
  ======================================================= */

  const currentProfile =
    profile || {

      telegram_id:
        userId,

      first_name:
        "User",

      username:
        null,

      coins:
        0,

      energy:
        0,

      mined_coins:
        0,

      streak:
        1,

      wallet_address:
        null,

      referral_code:
        referralCode,

      referred_by:
        null,

    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="
      flex
      flex-col
      h-screen
      w-screen
      max-w-md
      mx-auto
      bg-slate-950
      text-slate-100
      font-sans
      select-none
      overflow-hidden
      relative
      shadow-2xl
      border
      border-slate-800
    ">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="
        px-5
        pt-6
        pb-3
        flex
        justify-between
        items-center
        z-10
        shrink-0
      ">

        <div className="
          flex
          items-center
          space-x-3
        ">

          <div className="
            w-10
            h-10
            rounded-xl
            bg-gradient-to-tr
            from-indigo-500
            to-purple-500
            flex
            items-center
            justify-center
            font-bold
            text-lg
            text-white
            shadow-lg
          ">

            A

          </div>


          <div>

            <h1 className="
              text-lg
              font-extrabold
              tracking-wide
              text-white
            ">

              AdDev Rewards

            </h1>


            <div className="
              flex
              items-center
              space-x-1
              text-xs
              text-indigo-400
              font-medium
            ">

              <ShieldCheck className="
                w-3.5
                h-3.5
                text-emerald-400
              " />

              <span>
                Level: Pro Publisher
              </span>

            </div>

          </div>

        </div>


        <div className="
          flex
          items-center
          space-x-2
          bg-slate-900/90
          border
          border-slate-800
          px-3
          py-1.5
          rounded-full
        ">

          <Flame className="
            w-4
            h-4
            text-orange-500
          " />

          <span className="
            text-sm
            font-bold
            text-orange-400
          ">

            {currentProfile.streak}
            {" "}
            Days

          </span>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="
        flex-1
        overflow-y-auto
        px-5
        py-2
        z-10
        pb-24
      ">


        {/* ===============================================
            HOME
        =============================================== */}

        {activeTab === "home" && (

          <div className="
            flex
            flex-col
            items-center
            space-y-3
          ">


            {/* BALANCE */}

            <div className="
              text-center
              bg-slate-900/90
              border
              border-slate-800/80
              rounded-3xl
              p-4
              w-full
              shadow-xl
            ">

              <p className="
                text-[11px]
                uppercase
                tracking-widest
                text-slate-400
                font-semibold
                mb-1
              ">

                Total AdCoins

              </p>


              <div className="
                flex
                items-center
                justify-center
                space-x-2
              ">

                <Coins className="
                  w-7
                  h-7
                  text-yellow-400
                " />


                <span className="
                  text-3xl
                  font-black
                  text-transparent
                  bg-clip-text
                  bg-gradient-to-r
                  from-yellow-300
                  via-amber-400
                  to-yellow-500
                ">

                  {formatCoins(
                    currentProfile.coins
                  )}

                </span>

              </div>


              <p className="
                text-[10px]
                text-slate-400
                mt-1
              ">

                Min. Payout:
                {" "}
                {formatCoins(
                  MIN_WITHDRAWAL
                )}

                {" "}
                AdCoins

              </p>

            </div>


            {/* TAP */}

            <button
              onClick={handleTap}
              className="
                relative
                w-40
                h-40
                rounded-full
                bg-gradient-to-br
                from-indigo-600
                via-purple-600
                to-pink-600
                p-1.5
                shadow-2xl
                cursor-pointer
                active:scale-95
                transition-transform
                flex
                items-center
                justify-center
              "
            >

              <div className="
                w-full
                h-full
                rounded-full
                bg-slate-950
                flex
                flex-col
                items-center
                justify-center
              ">

                <Gamepad2 className="
                  w-12
                  h-12
                  text-indigo-400
                  mb-1
                " />

                <span className="
                  text-sm
                  font-bold
                  text-white
                  tracking-wider
                ">

                  TAP / PLAY

                </span>


                <span className="
                  text-[10px]
                  text-indigo-300
                  font-medium
                ">

                  +1 AdCoin

                </span>

              </div>

            </button>


            {/* ENERGY */}

            <div className="
              w-full
              bg-slate-900/80
              border
              border-slate-800
              rounded-2xl
              p-3
              shadow-lg
            ">

              <div className="
                flex
                justify-between
                items-center
                text-xs
                font-semibold
                mb-1.5
              ">

                <span className="
                  text-slate-300
                ">

                  Energy

                </span>


                <span className="
                  text-indigo-400
                  font-mono
                ">

                  {currentProfile.energy}
                  {" "}
                  /
                  {" "}
                  {MAX_ENERGY}

                </span>

              </div>


              <div className="
                w-full
                bg-slate-950
                rounded-full
                h-2
                overflow-hidden
                border
                border-slate-800
              ">

                <div
                  className="
                    bg-gradient-to-r
                    from-indigo-500
                    to-cyan-400
                    h-full
                    rounded-full
                  "
                  style={{
                    width:
                      `${
                        (
                          currentProfile.energy /
                          MAX_ENERGY
                        ) * 100
                      }%`,
                  }}
                />

              </div>

            </div>


            {/* MINING */}

            <div className="
              w-full
              bg-slate-900/80
              border
              border-slate-800
              rounded-2xl
              p-3
              flex
              items-center
              justify-between
              shadow-lg
            ">

              <div className="
                flex
                items-center
                space-x-3
              ">

                <div className="
                  w-9
                  h-9
                  rounded-xl
                  bg-amber-500/20
                  border
                  border-amber-500/30
                  flex
                  items-center
                  justify-center
                  text-amber-400
                ">

                  <Cpu className="
                    w-4
                    h-4
                  " />

                </div>


                <div>

                  <h3 className="
                    text-xs
                    font-bold
                    text-white
                  ">

                    Cloud Mining

                  </h3>


                  <p className="
                    text-[11px]
                    text-yellow-400
                    font-mono
                  ">

                    Mined:
                    {" "}
                    {formatCoins(
                      localMining
                    )}
                    {" "}
                    AdCoins

                  </p>

                </div>

              </div>


              <button
                onClick={
                  handleClaimMining
                }
                className="
                  bg-emerald-600
                  hover:bg-emerald-500
                  text-white
                  px-3
                  py-1.5
                  rounded-xl
                  text-xs
                  font-bold
                "
              >

                Claim

              </button>

            </div>

          </div>

        )}


        {/* ===============================================
            TASKS
        =============================================== */}

        {activeTab === "tasks" && (

          <div className="
            space-y-3
          ">


            <h2 className="
              text-lg
              font-bold
              text-white
            ">

              Tasks & Monetization

            </h2>


            {/* CPX */}

            <div className="
              bg-slate-900/80
              border
              border-slate-800
              rounded-2xl
              p-3.5
              flex
              items-center
              justify-between
              shadow-lg
            ">

              <div className="
                flex
                items-center
                space-x-3
              ">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-purple-500/20
                  border
                  border-purple-500/30
                  flex
                  items-center
                  justify-center
                  text-purple-400
                ">

                  📊

                </div>


                <div>

                  <h3 className="
                    text-xs
                    font-bold
                    text-white
                  ">

                    CPX Research

                  </h3>


                  <p className="
                    text-[11px]
                    text-slate-400
                  ">

                    High paying surveys

                  </p>

                </div>

              </div>


              <button
                onClick={() =>
                  setShowOfferwall(
                    true
                  )
                }
                className="
                  bg-purple-600
                  hover:bg-purple-500
                  text-white
                  px-3.5
                  py-2
                  rounded-xl
                  text-xs
                  font-bold
                  flex
                  items-center
                "
              >

                Open

                <ExternalLink className="
                  w-3
                  h-3
                  ml-1
                " />

              </button>

            </div>


            {/* STARS SHOP */}

            <div className="
              bg-gradient-to-r
              from-amber-950/40
              to-yellow-950/40
              border
              border-amber-500/30
              rounded-2xl
              p-4
              shadow-lg
            ">

              <div className="
                flex
                items-center
                space-x-2
                mb-3
              ">

                <Star className="
                  w-5
                  h-5
                  text-yellow-400
                  fill-yellow-400
                " />

                <h3 className="
                  text-sm
                  font-bold
                  text-white
                ">

                  Telegram Stars Shop

                </h3>

              </div>


              <div className="
                grid
                grid-cols-2
                gap-2.5
              ">


                <button
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    buyWithStars(
                      "energy"
                    )
                  }
                  className="
                    bg-slate-900/90
                    border
                    border-amber-500/20
                    p-3
                    rounded-xl
                    text-left
                    disabled:opacity-50
                  "
                >

                  <div className="
                    text-xs
                    font-bold
                    text-white
                  ">

                    ⚡ Energy Refill

                  </div>


                  <div className="
                    text-[11px]
                    text-yellow-400
                    font-extrabold
                    mt-1
                  ">

                    50 Stars ⭐

                  </div>

                </button>


                <button
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    buyWithStars(
                      "coins"
                    )
                  }
                  className="
                    bg-slate-900/90
                    border
                    border-amber-500/20
                    p-3
                    rounded-xl
                    text-left
                    disabled:opacity-50
                  "
                >

                  <div className="
                    text-xs
                    font-bold
                    text-white
                  ">

                    🪙 +5,000 AdCoins

                  </div>


                  <div className="
                    text-[11px]
                    text-yellow-400
                    font-extrabold
                    mt-1
                  ">

                    100 Stars ⭐

                  </div>

                </button>

              </div>


              <p className="
                text-[9px]
                text-slate-500
                mt-3
              ">

                Pagesa hapet përmes Telegram Stars.
                Invoice-i gjenerohet nga backend.

              </p>

            </div>


            {/* ADSGRAM */}

            <div className="
              bg-slate-900/80
              border
              border-slate-800
              rounded-2xl
              p-3.5
              flex
              items-center
              justify-between
              shadow-lg
            ">

              <div className="
                flex
                items-center
                space-x-3
              ">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-cyan-500/20
                  border
                  border-cyan-500/30
                  flex
                  items-center
                  justify-center
                  text-cyan-400
                ">

                  <PlaySquare className="
                    w-5
                    h-5
                  " />

                </div>


                <div>

                  <h3 className="
                    text-xs
                    font-bold
                    text-white
                  ">

                    Watch Sponsored Ad

                  </h3>


                  <p className="
                    text-[11px]
                    text-slate-400
                  ">

                    Adsgram

                  </p>

                </div>

              </div>


              <button
                disabled={
                  isWatchingAd
                }
                onClick={
                  handleWatchAdsgram
                }
                className="
                  bg-cyan-600
                  hover:bg-cyan-500
                  text-white
                  px-3.5
                  py-2
                  rounded-xl
                  text-xs
                  font-bold
                  disabled:opacity-50
                "
              >

                {isWatchingAd
                  ? "Loading..."
                  : "Watch"}

              </button>

            </div>


            {/* ENERGY BONUS */}

            <div className="
              bg-slate-900/80
              border
              border-slate-800
              rounded-2xl
              p-3.5
              flex
              items-center
              justify-between
              shadow-lg
            ">

              <div className="
                flex
                items-center
                space-x-3
              ">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-yellow-500/10
                  flex
                  items-center
                  justify-center
                ">

                  <Gift className="
                    w-5
                    h-5
                    text-yellow-400
                  " />

                </div>


                <div>

                  <h3 className="
                    text-xs
                    font-bold
                    text-white
                  ">

                    Energy Bonus

                  </h3>


                  <p className="
                    text-[11px]
                    text-slate-400
                  ">

                    Restore your energy

                  </p>

                </div>

              </div>


              <button
                onClick={() => {

                  setProfile(
                    previous =>
                      previous
                        ? {
                            ...previous,
                            energy:
                              MAX_ENERGY,
                          }
                        : previous
                  );


                  showNotice(
                    "Energy",
                    "Energy restored to 1000.",
                    "success"
                  );

                }}
                className="
                  bg-indigo-600
                  text-white
                  px-3.5
                  py-2
                  rounded-xl
                  text-xs
                  font-bold
                "
              >

                Refill

              </button>

            </div>

          </div>

        )}


        {/* ===============================================
            WITHDRAW
        =============================================== */}

        {activeTab === "withdraw" && (

          <div className="
            space-y-4
          ">


            <div className="
              bg-slate-900
              border
              border-slate-800
              rounded-3xl
              p-5
              shadow-xl
            ">

              <div className="
                flex
                justify-between
                items-center
                mb-1
              ">

                <h2 className="
                  text-lg
                  font-bold
                  text-white
                ">

                  Withdraw

                </h2>


                <button
                  onClick={() =>
                    setShowHistory(
                      true
                    )
                  }
                  className="
                    text-slate-400
                  "
                >

                  <History className="
                    w-5
                    h-5
                  " />

                </button>

              </div>


              <p className="
                text-xs
                text-slate-400
                mb-4
              ">

                Minimum payout:
                {" "}
                <strong>
                  {formatCoins(
                    MIN_WITHDRAWAL
                  )}
                  {" "}
                  AdCoins
                </strong>

              </p>


              {/* WALLET */}

              <div className="
                mb-4
                bg-slate-950
                border
                border-slate-800
                rounded-2xl
                p-3.5
                flex
                items-center
                justify-between
              ">

                <div>

                  <span className="
                    block
                    text-[10px]
                    text-slate-400
                    uppercase
                  ">

                    TON Wallet

                  </span>


                  <span className="
                    text-xs
                    font-bold
                    text-emerald-400
                  ">

                    {currentProfile.wallet_address
                      ? currentProfile.wallet_address
                      : "Not Connected"}

                  </span>

                </div>


                <button
                  onClick={
                    handleConnectWallet
                  }
                  className="
                    bg-indigo-600
                    text-white
                    px-3
                    py-2
                    rounded-xl
                    text-xs
                    font-bold
                  "
                >

                  Connect

                </button>

              </div>


              {/* FORM */}

              <form
                onSubmit={
                  handleWithdraw
                }
                className="
                  space-y-3
                "
              >

                <input
                  type="number"
                  min={
                    MIN_WITHDRAWAL
                  }
                  value={
                    withdrawAmount
                  }
                  onChange={e =>
                    setWithdrawAmount(
                      e.target.value
                    )
                  }
                  placeholder="75000 AdCoins"
                  className="
                    w-full
                    bg-slate-950
                    border
                    border-slate-800
                    rounded-xl
                    px-3.5
                    py-3
                    text-xs
                    text-white
                    outline-none
                  "
                />


                <button
                  type="submit"
                  disabled={
                    actionLoading
                  }
                  className="
                    w-full
                    bg-emerald-600
                    hover:bg-emerald-500
                    text-white
                    font-bold
                    py-3
                    rounded-xl
                    text-xs
                    flex
                    items-center
                    justify-center
                    gap-2
                    disabled:opacity-50
                  "
                >

                  {actionLoading
                    ? "Processing..."
                    : "Request Withdrawal"}

                  <ArrowUpRight className="
                    w-4
                    h-4
                  " />

                </button>

              </form>

            </div>


            {/* BALANCE */}

            <div className="
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-4
            ">

              <p className="
                text-xs
                text-slate-400
              ">

                Available balance

              </p>


              <p className="
                text-2xl
                font-black
                text-yellow-400
                mt-1
              ">

                {formatCoins(
                  currentProfile.coins
                )}

                {" "}
                <span className="
                  text-xs
                  font-normal
                ">

                  AdCoins

                </span>

              </p>

            </div>

          </div>

        )}


        {/* ===============================================
            FRIENDS
        =============================================== */}

        {activeTab === "friends" && (

          <div className="
            space-y-4
          ">


            <div className="
              bg-slate-900
              border
              border-slate-800
              rounded-3xl
              p-5
              text-center
            ">

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-indigo-500/10
                border
                border-indigo-500/20
                flex
                items-center
                justify-center
                mx-auto
                mb-3
              ">

                <Users className="
                  w-7
                  h-7
                  text-indigo-400
                " />

              </div>


              <h2 className="
                text-lg
                font-bold
                text-white
              ">

                Referral Program

              </h2>


              <p className="
                text-xs
                text-slate-400
                mt-1
                mb-5
              ">

                Fto shokët dhe fito
                {" "}
                <strong>
                  1,000 AdCoins
                </strong>
                {" "}
                për çdo referral.

              </p>


              <div className="
                bg-slate-950
                border
                border-slate-800
                rounded-xl
                p-3
                text-left
                mb-3
              ">

                <p className="
                  text-[10px]
                  text-slate-500
                  mb-1
                ">

                  YOUR REFERRAL LINK

                </p>


                <p className="
                  text-[11px]
                  text-indigo-300
                  break-all
                ">

                  {referralLink ||
                    "Open inside Telegram"}

                </p>

              </div>


              <button
                onClick={
                  handleCopyReferral
                }
                className="
                  w-full
                  bg-indigo-600
                  hover:bg-indigo-500
                  text-white
                  font-bold
                  py-3
                  rounded-2xl
                  text-xs
                  flex
                  items-center
                  justify-center
                  space-x-2
                "
              >

                {copiedRef ? (
                  <CheckCircle2 className="
                    w-4
                    h-4
                  " />
                ) : (
                  <Copy className="
                    w-4
                    h-4
                  " />
                )}


                <span>

                  {copiedRef
                    ? "Copied!"
                    : "Copy Referral Link"}

                </span>

              </button>

            </div>


            <div className="
              bg-slate-900/80
              border
              border-slate-800
              rounded-2xl
              p-4
            ">

              <h3 className="
                text-sm
                font-bold
                text-white
                mb-2
              ">

                How Referral Works

              </h3>


              <div className="
                space-y-2
                text-xs
                text-slate-400
              ">

                <p>
                  1. Copy your referral link.
                </p>

                <p>
                  2. Send it to your friend.
                </p>

                <p>
                  3. Your friend opens the bot.
                </p>

                <p>
                  4. Referral is registered.
                </p>

                <p>
                  5. Reward is processed by Supabase.
                </p>

              </div>

            </div>

          </div>

        )}


        {/* ===============================================
            RANKING
        =============================================== */}

        {activeTab === "ranking" && (

          <div className="
            space-y-3
          ">


            <h2 className="
              text-lg
              font-bold
              text-white
            ">

              Global Leaderboard

            </h2>


            {leaderboard.length === 0 ? (

              <div className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-5
                text-center
                text-xs
                text-slate-500
              ">

                Leaderboard do të shfaqet
                pasi të lidhet Supabase.

              </div>

            ) : (

              leaderboard.map(
                (
                  player,
                  index
                ) => (

                  <div
                    key={
                      player.telegram_id
                    }
                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-2xl
                      p-3
                      flex
                      justify-between
                      items-center
                    "
                  >

                    <div className="
                      flex
                      items-center
                      gap-3
                    ">

                      <span className="
                        text-xs
                        font-bold
                        text-slate-500
                        w-5
                      ">

                        #{index + 1}

                      </span>


                      <span className="
                        text-xs
                        font-bold
                        text-white
                      ">

                        {player.first_name ||
                          player.username ||
                          "Player"}

                      </span>

                    </div>


                    <span className="
                      text-xs
                      font-extrabold
                      text-yellow-400
                    ">

                      {formatCoins(
                        player.coins
                      )}

                      {" "}
                      AdCoins

                    </span>

                  </div>

                )
              )

            )}

          </div>

        )}

      </main>


      {/* =================================================
          OFFERWALL MODAL
      ================================================= */}

      {showOfferwall && (

        <div className="
          absolute
          inset-0
          bg-slate-950
          z-50
          flex
          flex-col
          p-4
        ">


          <div className="
            flex
            justify-between
            items-center
            mb-3
          ">

            <h3 className="
              text-sm
              font-bold
              text-white
            ">

              CPX Research

            </h3>


            <button
              onClick={() =>
                setShowOfferwall(
                  false
                )
              }
              className="
                text-slate-300
              "
            >

              <X className="
                w-5
                h-5
              " />

            </button>

          </div>


          <div className="
            flex-1
            bg-slate-900
            border
            border-slate-800
            rounded-3xl
            p-4
            flex
            flex-col
            items-center
            justify-center
            text-center
          ">

            <div className="
              w-14
              h-14
              rounded-2xl
              bg-purple-500/10
              flex
              items-center
              justify-center
              mb-4
            ">

              <CheckSquare className="
                w-7
                h-7
                text-purple-400
              " />

            </div>


            <h3 className="
              text-white
              font-bold
              mb-2
            ">

              Earn AdCoins

            </h3>


            <p className="
              text-xs
              text-slate-400
              mb-5
              max-w-xs
            ">

              Complete surveys and offers
              to earn rewards.

            </p>


            <a
              href={
                cpxOfferwallUrl
              }
              target="_blank"
              rel="noreferrer"
              className="
                bg-purple-600
                hover:bg-purple-500
                text-white
                font-bold
                py-3
                px-5
                rounded-2xl
                text-xs
              "
            >

              Open CPX Surveys
              {" "}
              <ExternalLink className="
                inline
                w-3
                h-3
              " />

            </a>

          </div>

        </div>

      )}


      {/* =================================================
          WITHDRAW HISTORY
      ================================================= */}

      {showHistory && (

        <div className="
          absolute
          inset-0
          bg-slate-950
          z-50
          flex
          flex-col
          p-4
        ">


          <div className="
            flex
            justify-between
            items-center
            mb-4
          ">

            <h3 className="
              text-lg
              font-bold
              text-white
            ">

              Withdrawal History

            </h3>


            <button
              onClick={() =>
                setShowHistory(
                  false
                )
              }
            >

              <X className="
                w-5
                h-5
                text-slate-300
              " />

            </button>

          </div>


          <div className="
            flex-1
            overflow-y-auto
            space-y-2
          ">


            {withdrawals.length === 0 ? (

              <div className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-5
                text-center
                text-xs
                text-slate-500
              ">

                No withdrawal requests yet.

              </div>

            ) : (

              withdrawals.map(
                item => (

                  <div
                    key={
                      item.id
                    }
                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-2xl
                      p-3
                    "
                  >

                    <div className="
                      flex
                      justify-between
                      items-center
                    ">

                      <span className="
                        text-xs
                        font-bold
                        text-yellow-400
                      ">

                        {formatCoins(
                          item.amount
                        )}
                        {" "}
                        AdCoins

                      </span>


                      <span className="
                        text-[10px]
                        uppercase
                        text-slate-400
                      ">

                        {item.status}

                      </span>

                    </div>


                    <p className="
                      text-[10px]
                      text-slate-500
                      mt-1
                    ">

                      {formatDate(
                        item.created_at
                      )}

                    </p>

                  </div>

                )
              )

            )}

          </div>

        </div>

      )}


      {/* =================================================
          NOTICE MODAL
      ================================================= */}

      {notice && (

        <div className="
          absolute
          inset-0
          bg-black/60
          z-[100]
          flex
          items-center
          justify-center
          p-5
        ">

          <div className="
            w-full
            max-w-sm
            bg-slate-900
            border
            border-slate-700
            rounded-3xl
            p-5
            shadow-2xl
          ">

            <div className="
              flex
              justify-between
              items-start
              gap-3
            ">

              <div>

                <h3 className="
                  text-lg
                  font-bold
                  text-white
                ">

                  {notice.title}

                </h3>


                <p className="
                  text-sm
                  text-slate-300
                  mt-2
                  leading-6
                ">

                  {notice.message}

                </p>

              </div>


              <button
                onClick={() =>
                  setNotice(
                    null
                  )
                }
              >

                <X className="
                  w-5
                  h-5
                  text-slate-400
                " />

              </button>

            </div>


            <button
              onClick={() =>
                setNotice(
                  null
                )
              }
              className="
                w-full
                mt-5
                bg-indigo-600
                hover:bg-indigo-500
                text-white
                font-bold
                py-3
                rounded-xl
                text-sm
              "
            >

              OK

            </button>

          </div>

        </div>

      )}


      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

      <nav className="
        absolute
        bottom-0
        left-0
        right-0
        bg-slate-900/95
        border-t
        border-slate-800
        px-2
        py-1.5
        z-20
        flex
        justify-around
      ">


        {[
          {
            id: "home" as Tab,
            label: "Home",
            icon: Home,
          },

          {
            id: "tasks" as Tab,
            label: "Tasks",
            icon: CheckSquare,
          },

          {
            id: "withdraw" as Tab,
            label: "Withdraw",
            icon: Wallet,
          },

          {
            id: "friends" as Tab,
            label: "Friends",
            icon: Users,
          },

          {
            id: "ranking" as Tab,
            label: "Ranking",
            icon: Trophy,
          },

        ].map(
          tab => {

            const Icon =
              tab.icon;

            const active =
              activeTab ===
              tab.id;


            return (

              <button
                key={
                  tab.id
                }
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
                className={`
                  flex
                  flex-col
                  items-center
                  py-1
                  px-3
                  rounded-2xl
                  ${
                    active
                      ? "text-indigo-400 bg-indigo-500/10"
                      : "text-slate-400"
                  }
                `}
              >

                <Icon className="
                  w-5
                  h-5
                " />


                <span className="
                  text-[10px]
                  font-semibold
                  mt-0.5
                ">

                  {tab.label}

                </span>

              </button>

            );

          }
        )}

      </nav>

    </div>

  );

}
