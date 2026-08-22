import React, { useState, useEffect } from 'react';
import { 
  Home, 
  CheckSquare, 
  Users, 
  Trophy, 
  Flame, 
  Sparkles, 
  Share2, 
  Gift, 
  Gamepad2, 
  ShieldCheck, 
  ExternalLink,
  Coins
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
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Total Balance</p>
              <div className="flex items-center justify-center space-x-2">
                <Coins className="w-7 h-7 text-yellow-400 animate-bounce" />
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                  {coins.toLocaleString()}
                </span>
              </div>
            </div>

            <div 
              onClick={handleTap}
              className="relative w-52 h-52 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1.5 shadow-2xl shadow-indigo-500/40 cursor-pointer active:scale-95 transition-transform duration-100 flex items-center justify-center group"
            >
              <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-slate-900 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none"></div>
                <Gamepad2 className="w-16 h-16 text-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-base font-bold text-white tracking-wider">TAP / PLAY</span>
                <span className="text-[11px] text-indigo-300 font-medium mt-0.5">+1 Coin</span>
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
                  <p className="text-[10px] text-purple-300/80">Earn rewards</p>
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
                  <p className="text-[10px] text-amber-300/80">{claimedDaily ? 'Claimed ✅' : '+500 Coins'}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3 pt-1">
            <h2 className="text-lg font-bold text-white mb-3">Tasks & Offerwall</h2>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">📊</div>
                <div>
                  <h3 className="text-xs font-bold text-white">CPX Research Offerwall</h3>
                  <p className="text-[11px] text-slate-400">Sponsored surveys</p>
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

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">📢</div>
                <div>
                  <h3 className="text-xs font-bold text-white">Telegram Channel</h3>
                  <p className="text-[11px] text-slate-400">+250 Coins</p>
                </div>
              </div>
              <button 
                onClick={() => alert('Channel claimed successfully!')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Claim
              </button>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-4 pt-1 text-center">
            <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5">Invite Friends</h2>
              <p className="text-xs text-slate-400 mb-5">Earn 1,000 coins for every friend you invite!</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Invite link copied to clipboard!');
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg text-xs flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Copy Invite Link</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-2.5 pt-1">
            <h2 className="text-lg font-bold text-white mb-2">Global Leaderboard</h2>
            {[
              { rank: 1, name: 'Fidan Beciri', coins: '145,200', badge: '👑' },
              { rank: 2, name: 'Ardit K.', coins: '98,450', badge: '🥈' },
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
