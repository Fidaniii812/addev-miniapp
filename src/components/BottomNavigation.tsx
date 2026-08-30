import React from 'react';
import { Home, CheckSquare, Wallet, Users, Trophy } from 'lucide-react';

interface BottomNavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function BottomNavigation({ currentTab, setCurrentTab }: BottomNavigationProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'withdraw', label: 'Withdraw', icon: Wallet },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-2 py-2 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-purple-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon size={22} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
