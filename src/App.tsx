import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Users, 
  CheckSquare, 
  Home, 
  Sparkles, 
  Flame, 
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Define Telegram WebApp global interface safely
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        isExpanded?: boolean;
        viewportHeight?: number;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        enableClosingConfirmation?: () => void;
      };
    };
  }
}

interface UserProfile {
  id: number;
  name: string;
  balance: number;
  energy: number;
  maxEnergy: number;
  streak: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'friends' | 'leaderboard'>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tapEffect, setTapEffect] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        if (tg.enableClosingConfirmation) {
          tg.enableClosingConfirmation();
        }

        const tgUser = tg.initDataUnsafe?.user;
        setUser({
          id: tgUser?.id || 1001,
          name: tgUser?.first_name || 'Kreator',
          balance: 14250,
          energy: 850,
          maxEnergy: 1000,
          streak: 5,
        });
      } else {
        setUser({
          id: 1001,
          name: 'Përdorues Test',
          balance: 14250,
          energy: 850,
          maxEnergy: 1000,
          streak: 5,
        });
      }
    } catch (err: any) {
      console.error("Gabim gjatë inicializimit të Telegram WebApp:", err);
      setError("Nuk u arrit të ngarkohej konteksti i Telegram Mini App.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!user || user.energy < 10) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setUser(prev => prev ? {
      ...prev,
      balance: prev.balance + 10,
      energy: Math.max(0, prev.energy - 10)
    } : null);

    const newTap = { id: Date.now(), x, y };
    setTapEffect(state => [...state, newTap]);

    setTimeout(() => {
      setTapEffect(state => state.filter(t => t.id !== newTap.id));
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-3" />
        <p className="text-sm font-medium text-slate-400">Duke u ngarkuar Mini App...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold mb-1">Ndodhi një gabim</h2>
        <p className="text-sm text-slate-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-all text-sm"
        >
          Provo përsëri
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      <header className="flex items-center justify-between px-5 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            {user?.name.charAt(0) || 'K'}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-200 leading-tight">{user?.name}</h1>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{user?.streak} Ditë Seri</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm tracking-wide text-cyan-300">
            {user?.balance.toLocaleString()}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {activeTab === 'home' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-slate-900/60 p-5 rounded-3xl border border-slate-800/80 shadow-2xl mb-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Niveli Aktual</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Pro Gamer
                </span>
              </div>
              <div className="text-center my-3">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  {user?.balance.toLocaleString()} <span className="text-cyan-400 text-lg font-medium">COINS</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Kliko kartën për të fituar pikë shtesë</p>
              </div>
            </div>

            <div 
              onClick={handleTap}
              className="relative w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center cursor-pointer shadow-[0_0_50px_rgba(6,182,212,0.3)] active:scale-95 transition-transform duration-100 border-4 border-slate-900"
            >
              <div className="absolute inset-2 rounded-full border border-white/20 pointer-events-none"></div>
              <div className="flex flex-col items-center pointer-events-none">
                <Trophy className="w-16 h-16 text-white drop-shadow-md mb-2 animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-cyan-100 font-bold">Kliko Këtu</span>
              </div>

              {tapEffect.map(t => (
                <span
                  key={t.id}
                  style={{ left: t.x, top: t.y }}
                  className="absolute pointer-events-none text-emerald-400 font-black text-xl animate-fade-up"
                >
                  +10
                </span>
              ))}
            </div>

            <div className="w-full max-w-xs mt-8">
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-400" /> Energjia</span>
                <span className="text-slate-200">{user?.energy} / {user?.maxEnergy}</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${((user?.energy || 0) / (user?.maxEnergy || 1000)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Detyrat Ditore</h2>
              <p className="text-xs text-slate-400">Plotëso detyrat për të fituar shpërblime ekskluzive.</p>
            </div>

            {[
              { title: 'Bashkohu në Kanalin Zyrtar', reward: '+5,000 COINS', done: true },
              { title: 'Fto 3 Miq në Telegram', reward: '+15,000 COINS', done: false },
              { title: 'Vizito partnerin tonë', reward: '+2,500 COINS', done: false },
              { title: 'Kryej 100 klikime sot', reward: '+1,000 COINS', done: false },
            ].map((task, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{task.title}</h3>
                    <p className="text-xs text-cyan-400 font-medium mt-0.5">{task.reward}</p>
                  </div>
                </div>
                <button 
                  disabled={task.done}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${task.done ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'}`}
                >
                  {task.done ? 'Kryer' : 'Fito'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-4 max-w-md mx-auto text-center py-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <Users className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white mb-1">Fto Miqtë & PërFito</h2>
              <p className="text-xs text-slate-400 mb-6">Për çdo mik që fton, ju dhe miku juaj fitoni nga 10,000 COINS bonus.</p>
              
              <button 
                onClick={() => {
                  if (window.Telegram?.WebApp) {
                    const shareUrl = `https://t.me/share/url?url=https://t.me/YourBotName/app?start=ref_${user?.id}&text=${encodeURIComponent('Krijo monedha dhe fito shpërblime në Telegram Mini App!')}`;
                    window.open(shareUrl, '_blank');
                  } else {
                    alert('Linku i referimit u kopjua!');
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-cyan-600/25 transition-all"
              >
                Fto Miqtë Tani
              </button>
            </div>

            <div className="text-left mt-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Miqtë e ftuar (0)</h3>
              <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center text-xs text-slate-500">
                Ende nuk keni ftuar asnjë mik. Ftoni të parin!
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-3 max-w-md mx-auto">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Renditja Botërore</h2>
              <p className="text-xs text-slate-400">Lojtarët më të mirë të këtij sezoni.</p>
            </div>

            {[
              { rank: 1, name: 'Arben K.', score: '1,420,500' },
              { rank: 2, name: 'Elona M.', score: '985,200' },
              { rank: 3, name: 'Besnik G.', score: '750,100' },
              { rank: 4, name: user?.name || 'Ju', score: user?.balance.toLocaleString() || '14,250', isUser: true },
              { rank: 5, name: 'Dritan S.', score: '12,000' },
            ].map((player) => (
              <div 
                key={player.rank} 
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${player.isUser ? 'bg-cyan-950/30 border-cyan-500/40' : 'bg-slate-900/60 border-slate-800'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${player.rank === 1 ? 'bg-amber-500/20 text-amber-400' : player.rank === 2 ? 'bg-slate-300/20 text-slate-200' : player.rank === 3 ? 'bg-amber-700/20 text-amber-600' : 'bg-slate-800 text-slate-400'}`}>
                    {player.rank}
                  </span>
                  <span className={`text-sm font-semibold ${player.isUser ? 'text-cyan-300 font-bold' : 'text-slate-200'}`}>
                    {player.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-cyan-400">{player.score} COINS</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 flex justify-around items-center z-20">
        {[
          { id: 'home', label: 'Kryesore', icon: Home },
          { id: 'tasks', label: 'Detyrat', icon: CheckSquare },
          { id: 'friends', label: 'Miqtë', icon: Users },
          { id: 'leaderboard', label: 'Renditja', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all ${isActive ? 'text-cyan-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
