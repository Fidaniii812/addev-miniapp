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
  Star
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
  
  // Withdraw & Wallet States
  const [connectedWallet, setConnectedWallet] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState<boolean>(false);

  // Rewarded Ad Simulation State
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(0);

  // Referral Link State
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const referralLink = "https://t.me/AdDevRewardsBot?start=ref_" + Math.floor(Math.random() * 1000000);

  // CPX Research Offerwall configured with App ID: 34909
  const cpxAppId = "34909";
  const userId = "telegram_user_" + Math.floor(Math.random() * 1000000);
  const cpxOfferwallUrl = `https://offers.cpx-research.com/index.php?app_id=${cpxAppId}&ext_user_id=${userId}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy((prev) => (prev < maxEnergy ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, [maxEnergy]);

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

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    setAdCountdown(5);
    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsWatchingAd(false);
          setCoins(c => c + 250);
          alert('Congratulations! You earned +250 AdCoins for watching the sponsored video.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Connect Telegram Wallet Simulation (TON Connect)
  const handleConnectWallet = () => {
    // Simulated successful connection to Telegram Wallet
    const mockAddress = "EQD4...9xK2 (TON Wallet)";
    setConnectedWallet(mockAddress);
    alert('Telegram Wallet connected successfully!');
  };

  // Telegram Stars Purchase Handler
  const handleBuyWithStars = (packageType: string, starCost: number) => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.openInvoice) {
      alert(`Initiating Telegram Stars payment for ${packageType} (${starCost} Stars)...`);
    } else {
      if (confirm(`[Browser Simulation] Spend ${starCost} Telegram Stars to purchase ${packageType}?`)) {
        if (packageType === 'Energy Refill') {
          setEnergy(maxEnergy);
        } else if (packageType === '5,000 AdCoins') {
          setCoins(c => c + 5000);
        }
        alert('Purchase successful! Items added to your account.');
      }
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
    if (amountNum < 50000) {
      alert('Minimum withdrawal amount is 50,000 AdCoins (10€).');
      return;
    }

    setIsSubmittingWithdraw(true);
    setTimeout(() => {
      setCoins(prev => prev - amountNum);
      setIsSubmittingWithdraw(false);
      setWithdrawAmount('');
      alert('Withdrawal request of 10€+ submitted successfully to your Telegram Wallet! Processing time: 24h.');
    }, 1000);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-screen max-w-md mx-auto bg-slate-950 text-slate-100 font-sans select-none overflow-hidden relative shadow-2xl border border-slate-800">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Section */}
      <header className="px-5 pt-6 pb-3 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/30 text-white">
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

        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full shadow-inner">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="text-sm font-bold text-orange-400">{dailyStreak} Days</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-5 py-2 z-10 pb-24">
        
        {activeTab === 'home' && (
          <div className="flex flex-col items-center justify-center space-y-5 pt-1">
            <div className="text-center bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-3xl p-5 w-full shadow-xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Total AdCoins</p>
              <div className="flex items-center justify-center space-x-2">
                <Coins className="w-7 h-7 text-yellow-400 animate-bounce" />
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                  {coins.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Value: ~{((coins / 50000) * 10).toFixed(2)}€ (Rate: 50k = 10€)</p>
            </div>

            <div 
              onClick={handleTap}
              className="relative w-52 h-52 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1.5 shadow-2xl shadow-indigo-500/40 cursor-pointer active:scale-95 transition-transform duration-100 flex items-center justify-center group"
            >
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-slate-900 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none"></div>
                <Gamepad2 className="w-16 h-16 text-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-base font-bold text-white tracking-wider">TAP / PLAY</span>
                <span className="text-[11px] text-indigo-300 font-medium mt-0.5">+1 AdCoin</span>
              </div>
            </div>

            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-lg">
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-slate-300 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                  <span>Energy</span>
                </span>
                <span className="text-indigo-400 font-mono">{energy} / {maxEnergy}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(energy / maxEnergy) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={() => setShowOfferwallModal(true)}
                className="flex items-center space-x-2.5 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 hover:border-purple-500/60 p-3 rounded-2xl transition-all shadow-lg text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Ads & Rewards</h4>
                  <p className="text-[10px] text-purple-300/80">Earn AdCoins</p>
                </div>
              </button>

              <button 
                onClick={handleClaimDaily}
                disabled={claimedDaily}
                className={`flex items-center space-x-2.5 p-3 rounded-2xl transition-all shadow-lg text-left border ${claimedDaily ? 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-500/30 hover:border-amber-500/60'}`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Daily Bonus</h4>
                  <p className="text-[10px] text-amber-300/80">{claimedDaily ? 'Claimed ✅' : '+500 AdCoins'}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3 pt-1">
            <h2 className="text-lg font-bold text-white mb-3">Tasks & Monetization</h2>
            
            {/* CPX Research Offerwall Task */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">📊</div>
                <div>
                  <h3 className="text-xs font-bold text-white">CPX Research Offerwall</h3>
                  <p className="text-[11px] text-slate-400">High paying surveys</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOfferwallModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>

            {/* Telegram Stars Shop Section */}
            <div className="bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="text-sm font-bold text-white">Telegram Stars Shop</h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => handleBuyWithStars('Energy Refill', 50)}
                  className="bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/50 p-2.5 rounded-xl text-left transition-all"
                >
                  <div className="text-xs font-bold text-white mb-0.5">⚡ Max Energy</div>
                  <div className="text-[11px] text-yellow-400 font-extrabold flex items-center space-x-1">
                    <span>50 Stars</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleBuyWithStars('5,000 AdCoins', 100)}
                  className="bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/50 p-2.5 rounded-xl text-left transition-all"
                >
                  <div className="text-xs font-bold text-white mb-0.5">🪙 +5,000 AdCoins</div>
                  <div className="text-[11px] text-yellow-400 font-extrabold flex items-center space-x-1">
                    <span>100 Stars</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Rewarded Ad Task */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <PlaySquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Watch Sponsored Ad</h3>
                  <p className="text-[11px] text-slate-400">+250 AdCoins per ad</p>
                </div>
              </div>
              <button 
                onClick={handleWatchAd}
                disabled={isWatchingAd}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
              >
                {isWatchingAd ? `Wait ${adCountdown}s` : 'Watch'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-4 pt-1">
            <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <Wallet className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Withdraw Funds</h2>
              <p className="text-xs text-slate-400 mb-4">Minimum payout: <strong>50,000 AdCoins (10€)</strong>.</p>

              {/* Telegram Wallet Connection Section */}
              <div className="mb-4 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Telegram Wallet</span>
                  <span className="text-xs font-bold text-emerald-400">{connectedWallet ? connectedWallet : 'Not Connected'}</span>
                </div>
                <button 
                  type="button"
                  onClick={handleConnectWallet}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow transition-all"
                >
                  {connectedWallet ? 'Change Wallet' : 'Connect Wallet'}
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Amount to Withdraw (AdCoins)</label>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Min. 50000 (10€)" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg text-xs flex items-center justify-center space-x-2 transition-all mt-2"
                >
                  <span>{isSubmittingWithdraw ? 'Processing...' : 'Request 10€+ Withdrawal'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-4 pt-1">
            <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5">Multi-Tier Referrals</h2>
              <p className="text-xs text-slate-400 mb-5">Earn 1,000 AdCoins for every direct friend + 10% lifetime commission from their activity!</p>
              
              <button 
                onClick={handleCopyRef}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg text-xs flex items-center justify-center space-x-2 transition-transform active:scale-95"
              >
                {copiedRef ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRef ? 'Link Copied Successfully!' : 'Copy Referral Link'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-2.5 pt-1">
            <h2 className="text-lg font-bold text-white mb-2">Global Leaderboard</h2>
            {[
              { rank: 1, name: 'Fidan Beciri', coins: '145,200 AdCoins', badge: '👑' },
              { rank: 2, name: 'Ardit K.', coins: '98,450 AdCoins', badge: '🥈' },
            ].map((user) => (
              <div key={user.rank} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400">{user.badge}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{user.name}</h4>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-yellow-400">{user.coins}</span>
              </div>
            ))}
          </div>
        )}

      </main>

      {showOfferwallModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Gift className="w-4 h-4 text-purple-400" />
              <span>CPX Research Offerwall (ID: 34909)</span>
            </h3>
            <button 
              onClick={() => setShowOfferwallModal(false)}
              className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center">
            <h4 className="text-sm font-bold text-white mb-1.5">Survey Wall Panel</h4>
            <a 
              href={cpxOfferwallUrl} 
              target="_blank" 
              rel="noreferrer"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-5 rounded-2xl shadow-lg text-xs flex items-center space-x-2 mt-3"
            >
              <span>Open Offerwall</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800/80 backdrop-blur-lg px-2 py-1.5 z-20 flex justify-around items-center shrink-0">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'withdraw', label: 'Withdraw', icon: Wallet },
          { id: 'friends', label: 'Friends', icon: Users },
          { id: 'ranking', label: 'Leaderboard', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${isActive ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
