import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ExternalLink, 
  Home, 
  CheckSquare, 
  Wallet, 
  Users, 
  Trophy 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [telegramUserId, setTelegramUserId] = useState<string>("123456789"); // Përditësohet nga Telegram WebApp nëse ekziston
  const [balance, setBalance] = useState<number>(15432);
  const [cpxOfferwallUrl, setCpxOfferwallUrl] = useState<string>("https:// oferta-shembull.com");

  useEffect(() => {
    // Marrja e ID-së së përdoruesit nga Telegram WebApp nëse është i disponueshëm
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      const uid = String(window.Telegram.WebApp.initDataUnsafe.user.id);
      setTelegramUserId(uid);
      // Përditësojmë linkun e offerwall ose referimit me ID-në e përdoruesit nëse duhet
      setCpxOfferwallUrl(`https://oferta-shembull.com?subId=${uid}`);
    }
  }, []);

  // Funksioni për të shfaqur reklamën e Adsgram me ID: 45299
  const handleShowAdsgramReward = async () => {
    if (window.Adsgram) {
      try {
        const adController = window.Adsgram.init({ blockId: "45299" });
        await adController.show();
        // Njoftim ose shtim pikësh pas shikimit të suksesshëm
        setBalance((prev) => prev + 10);
        alert("Urime! Fitove 10 pikë nga reklama.");
      } catch (error) {
        console.error("Reklama u mbyll ose dështoi:", error);
      }
    } else {
      alert("Adsgram SDK nuk u ngarkua. Ju lutem provojeni përsëri brenda Telegramit.");
    }
  };

  // Funksioni për të kopjuar linkun e referimit të përdoruesit
  const handleCopyReferralLink = () => {
    const refLink = `https://t.me/addev_rewards_bot?start=ref_${telegramUserId}`;
    navigator.clipboard.writeText(refLink);
    setCpxOfferwallUrl(refLink);
    alert("Linku i referimit u kopjua me sukses!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative pb-20 select-none">
      
      {/* PËRMBAJTJA SIPAS TAB-IT AKTIV */}
      <div className="p-4">
        {activeTab === "home" && (
          <div className="flex flex-col items-center justify-center pt-6">
            <h1 className="text-xl font-bold mb-2">AdDev Rewards</h1>
            <p className="text-sm text-slate-400 mb-6">Balanca: {balance} Pikë</p>

            {/* Butoni i Reklamës Adsgram (ID: 45299) */}
            <div className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center mb-4 shadow-lg">
              <h4 className="text-base font-bold text-white mb-2">Shiko Reklamën & Fito</h4>
              <p className="text-xs text-slate-400 mb-4 text-center">Shiko një reklamë të shkurtër dhe shto pikë në llogarinë tuaj.</p>
              <button
                onClick={handleShowAdsgramReward}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md"
              >
                📺 Shiko Reklamën (Adsgram)
              </button>
            </div>

            {/* Seksioni i Sondazheve / Offerwall */}
            <div className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center shadow-lg">
              <BarChart3 className="w-10 h-10 text-purple-400 mb-3" />
              <h4 className="text-base font-bold text-white mb-2">Complete Surveys</h4>
              <p className="text-xs text-slate-400 mb-4 text-center">Complete available surveys and earn rewards.</p>
              <button
                onClick={() => {
                  if (window.Telegram?.WebApp?.openLink) {
                    window.Telegram.WebApp.openLink(cpxOfferwallUrl);
                  } else {
                    window.open(cpxOfferwallUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2 transition-all"
              >
                Open Offerwall
                <ExternalLink className="w-4 h-4" />
              </button>
              <p className="text-[9px] text-slate-600 mt-4 break-all">
                User ID: {telegramUserId}
              </p>
            </div>
          </div>
        )}

        {activeTab === "friends" && (
          <div className="p-4 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-3">Ftoni Shokët</h2>
            <p className="text-xs text-slate-400 text-center mb-6">
              Ftoni miqtë tuaj dhe fitoni komisione ose pikë shtesë për çdo përdorues të ri!
            </p>
            <button
              onClick={handleCopyReferralLink}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-lg transition-all"
            >
              Kopjo Linkun e Referimit
            </button>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="p-4 text-center">
            <h2 className="text-lg font-bold mb-2">Detyrat</h2>
            <p className="text-xs text-slate-400">Kryej detyrat ditore për të fituar shpërblime shtesë.</p>
          </div>
        )}

        {activeTab === "withdraw" && (
          <div className="p-4 text-center">
            <h2 className="text-lg font-bold mb-2">Tërheqja (Withdraw)</h2>
            <p className="text-xs text-slate-400">Kërko tërheqjen e fondeve apo pikëve të tua.</p>
          </div>
        )}

        {activeTab === "ranking" && (
          <div className="p-4 text-center">
            <h2 className="text-lg font-bold mb-2">Ranking</h2>
            <p className="text-xs text-slate-400">Shiko përdoruesit më të mirë të platformës.</p>
          </div>
        )}
      </div>

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
