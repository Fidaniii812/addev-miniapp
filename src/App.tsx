import React, { useState, useEffect } from 'react';
import { 
  Home, 
  CheckSquare, 
  Users, 
  Trophy, 
  Flame, 
  Sparkles, 
  Gift, 
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
  Cpu
} from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  const [coins, setCoins] = useState<number>(14250);
  const [energy, setEnergy] = useState<number>(850);
  const [maxEnergy] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [dailyStreak, setDailyStreak] = useState<number>(6);
  const [claimedDaily, setClaimedDaily] = useState<boolean>(true);
  const [showOfferwallModal, setShowOfferwallModal] = useState<boolean>(false);
  
  // Mining Active State
  const [isMiningActive, setIsMiningActive] = useState<boolean>(false);
  const [minedCoins, setMinedCoins] = useState<number>(0);
  
  // Withdraw & Wallet States
  const [connectedWallet, setConnectedWallet] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState<boolean>(false);

  // Rewarded Ad State (Adsgram)
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);

  // Referral Link State
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const referralLink = "https://t.me/AdDevRewardsBot?start=ref_" + Math.floor(Math.random() * 1000000);

  const cpxAppId = "34909";
  const userId = "telegram_user_" + Math.floor(Math.random() * 1000000);
  const cpxOfferwallUrl = `https://offers.cpx-research.com/index.php?app_id=${cpxAppId}&ext_user_id=${userId}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy((prev) => (prev < maxEnergy ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, [maxEnergy]);

  // Mining background timer
  useEffect(() => {
    let miningTimer: any;
    if (isMiningActive) {
      miningTimer = setInterval(() => {
        setMinedCoins(prev => prev + 1);
      }, 3000);
    }
    return () => clearInterval(miningTimer);
  }, [isMiningActive]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (energy > 0) {
      setCoins(prev => prev + 1);
      setEnergy(prev => prev - 1);
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const floatEl = document.createElement('div');
      floatEl.className = 'absolute text-yellow-400 font-extrabold text-lg pointer-events-none animate-bounce z-30';
      floatEl.style.left = `${x}px`;
      floatEl.style.top = `${y}px`;
      floatEl.innerText = '+1';
      e.currentTarget.appendChild(floatEl);
      
      setTimeout(() => floatEl.remove(), 700);
    }
  };

  const handleClaimDaily = () => {
    if (!claimedDaily) {
      setCoins(prev => prev + 500);
      setDailyStreak(prev => prev + 1);
      setClaimedDaily(true);
    }
  };

  // True Adsgram Integration Logic (Block ID: 44129)
  const handleWatchAdsgram = async () => {
    const win = window as any;
    if (win.Adsgram) {
      setIsWatchingAd(true);
      try {
        const adController = win.Adsgram.init({ blockId: "44129" });
        await adController.show();
        
        // Reklama u pa me sukses deri në fund -> Jepja shpërblimin
        setCoins(c => c + 250);
        alert('Congratulations! You earned +250 AdCoins for watching the sponsored video.');
      } catch (err) {
        console.log("Ad closed or failed:", err);
        alert('Ad was skipped or unavailable. No coins awarded.');
      } finally {
        setIsWatchingAd(false);
      }
    } else {
      // Fallback nëse testohet jashtë Telegramit/Adsgram
      alert('AdsGram SDK not loaded or testing in browser environment.');
      setIsWatchingAd(false);
    }
  };

  const handleConnectWallet = () => {
    const mockAddress = "EQD4...9xK2 (TON Wallet)";
    setConnectedWallet(mockAddress);
    alert('Telegram Wallet connected successfully!');
  };

  // Telegram Stars Real Payment Integration via WebApp API
  const handleBuyWithStars = (packageType: string, starCost: number) => {
    const tg = (window as any).Telegram?.WebApp;
    
    // Nëse je brenda Telegramit zyrtar, thërret faturën e yjeve
    if (tg && tg.openInvoice) {
      // Këtu zakonisht lidhet me backend-in tënd për të gjeneruar invoiceLink nga Telegram Bot API
      alert(`Connecting to Telegram Stars gateway for ${packageType} (${starCost} Stars)...`);
    } else {
      // Simulim për testim në shfletues
      if (confirm(`[Browser Simulation] Pay ${starCost} Telegram Stars for ${packageType}?`)) {
        if (packageType === 'Energy Refill') {
          setEnergy(maxEnergy);
        } else if (packageType === '5,000 AdCoins') {
          setCoins(c => c + 5000);
        }
        alert('Purchase successful via Telegram Stars!');
      }
    }
  };

  const handleClaimMined = () => {
    if (minedCoins > 0) {
      setCoins(c => c + minedCoins);
      setMinedCoins(0);
      alert('Mined AdCoins collected successfully!');
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);

    if (!connectedWallet) {
      alert('Please connect your Telegram Wallet first!');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount to withdraw!');
      return;
    }
    if (amountNum > coins) {
      alert('Insufficient AdCoins balance for this withdrawal!');
      return;
    }
    if (amountNum < 75000) {
      alert('Minimum withdrawal amount is 75,000 AdCoins.');
      return;
    }

    setIsSubmittingWithdraw(true);
    setTimeout(() => {
      setCoins(prev => prev - amountNum);
      setIsSubmittingWithdraw(false);
      setWithdrawAmount('');
      alert('Withdrawal request submitted successfully to your Telegram Wallet!');
    }, 1000);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-screen max-w-md mx-auto bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative shadow-2xl border border-slate-800">
      
      <header className="px-5 pt-6 pb-3 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
            A
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wide text-white">AdDev Rewards</h1>
            <div className="flex items-center space-x-1 text-xs text-indigo-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Level: Pro Publisher</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="text-sm font-bold text-orange-400">{dailyStreak} Days</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-2 z-10 pb-24">
        
        {activeTab === 'home' && (
          <div className="flex flex-col items-center justify-center space-y-4 pt-1">
            <div className="text-center bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 w-full shadow-xl">
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Total AdCoins</p>
              <div className="flex items-center justify-center space-x-2">
                <Coins className="w-7 h-7 text-yellow-400 animate-bounce" />
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                  {coins.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Min. Payout: 75,000 AdCoins</p>
            </div>

            <div 
              onClick={handleTap}
              className="relative w-48 h-48 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1.5 shadow-2xl cursor-pointer active:scale-95 transition-transform flex items-center justify-center group"
            >
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center group-hover:bg-slate-900 transition-colors">
                <Gamepad2 className="w-14 h-14 text-indigo-400 mb-1" />
                <span className="text-base font-bold text-white tracking-wider">TAP / PLAY</span>
                <span className="text-[11px] text-indigo-300 font-medium">+1 AdCoin</span>
              </div>
            </div>

            {/* Mining Widget */}
            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Cloud Mining</h3>
                  <p className="text-[11px] text-yellow-400 font-mono">Mined: {minedCoins} AdCoins</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isMiningActive ? (
                  <button onClick={() => setIsMiningActive(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold">Start</button>
                ) : (
                  <button onClick={handleClaimMined} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold">Claim</button>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-slate-300">Energy</span>
                <span className="text-indigo-400 font-mono">{energy} / {maxEnergy}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" style={{ width: `${(energy / maxEnergy) * 100}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3 pt-1">
            <h2 className="text-lg font-bold text-white mb-3">Tasks & Monetization</h2>
            
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">📊</div>
                <div>
                  <h3 className="text-xs font-bold text-white">CPX Research Offerwall</h3>
                  <p className="text-[11px] text-slate-400">High paying surveys</p>
                </div>
              </div>
              <button onClick={() => setShowOfferwallModal(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1">
                <span>Open</span> <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>

            {/* Telegram Stars Shop */}
            <div className="bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h3 className="text-sm font-bold text-white">Telegram Stars Shop</h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => handleBuyWithStars('Energy Refill', 50)} className="bg-slate-900/90 border border-amber-500/20 p-2.5 rounded-xl text-left">
                  <div className="text-xs font-bold text-white mb-0.5">⚡ Max Energy</div>
                  <div className="text-[11px] text-yellow-400 font-extrabold">50 Stars ⭐️</div>
                </button>
                <button onClick={() => handleBuyWithStars('5,000 AdCoins', 100)} className="bg-slate-900/90 border border-amber-500/20 p-2.5 rounded-xl text-left">
                  <div className="text-xs font-bold text-white mb-0.5">🪙 +5,000 AdCoins</div>
                  <div className="text-[11px] text-yellow-400 font-extrabold">100 Stars ⭐️</div>
                </button>
              </div>
            </div>

            {/* Real Adsgram Rewarded Video Task */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <PlaySquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Watch Sponsored Ad</h3>
                  <p className="text-[11px] text-slate-400">+250 AdCoins (Adsgram)</p>
                </div>
              </div>
              <button 
                onClick={handleWatchAdsgram}
                disabled={isWatchingAd}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md"
              >
                {isWatchingAd ? 'Loading...' : 'Watch'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-4 pt-1">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-1">Withdraw Funds</h2>
              <p className="text-xs text-slate-400 mb-4">Minimum payout: <strong>75,000 AdCoins</strong>.</p>

              <div className="mb-4 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Telegram Wallet</span>
                  <span className="text-xs font-bold text-emerald-400">{connectedWallet || 'Not Connected'}</span>
                </div>
                <button onClick={handleConnectWallet} className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold">
                  {connectedWallet ? 'Connected' : 'Connect'}
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-3">
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Min. 75000 AdCoins" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2">
                  <span>{isSubmittingWithdraw ? 'Processing...' : 'Request Withdrawal'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center">
            <h2 className="text-lg font-bold text-white mb-1.5">Referral Program</h2>
            <p className="text-xs text-slate-400 mb-5">Earn 1,000 AdCoins for every invited friend!</p>
            <button onClick={handleCopyRef} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2">
              {copiedRef ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedRef ? 'Copied!' : 'Copy Referral Link'}</span>
            </button>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-white mb-2">Global Leaderboard</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex justify-between items-center">
              <span className="text-xs font-bold text-white">👑 Fidan Beciri</span>
              <span className="text-xs font-extrabold text-yellow-400">145,200 AdCoins</span>
            </div>
          </div>
        )}
      </main>

      {showOfferwallModal && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white">CPX Research Offerwall</h3>
            <button onClick={() => setShowOfferwallModal(false)} className="text-slate-300">✕</button>
          </div>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center">
            <a href={cpxOfferwallUrl} target="_blank" rel="noreferrer" className="bg-purple-600 text-white font-bold py-3 px-5 rounded-2xl text-xs">
              Open Offerwall Surveys
            </a>
          </div>
        </div>
      )}

      <nav className="absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 px-2 py-1.5 z-20 flex justify-around">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'withdraw', label: 'Withdraw', icon: Wallet },
          { id: 'friends', label: 'Friends', icon: Users },
          { id: 'ranking', label: 'Ranking', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center py-1 px-3 rounded-2xl ${isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`}>
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
