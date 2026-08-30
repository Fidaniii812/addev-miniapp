import React from 'react';
import { useTelegramUser } from '../hooks/useTelegramUser';

export default function Home() {
  const { user, loading } = useTelegramUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg animate-pulse">Loading AdDev Rewards...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto text-white pb-20">
      {/* Header Profile Section */}
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-700">
        <div>
          <h1 className="text-xl font-bold">Welcome, {user?.username || 'Publisher'}!</h1>
          <p className="text-sm text-gray-400">Level: Pro Publisher</p>
        </div>
        <div className="bg-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
          Active
        </div>
      </div>

      {/* Balance Card - Adscoin */}
      <div className="mt-6 bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-2xl shadow-lg border border-purple-700 text-center">
        <p className="text-sm text-purple-300 font-medium uppercase tracking-wider">Total Balance</p>
        <h2 className="text-4xl font-extrabold mt-2 text-yellow-400">
          {user?.points ?? 0} <span className="text-xl font-semibold text-white">Adscoin</span>
        </h2>
        <p className="text-xs text-gray-300 mt-2">Earn more by completing daily tasks and inviting friends.</p>
      </div>

      {/* Energy Status Card */}
      <div className="mt-4 bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Energy Level</p>
          <p className="text-lg font-bold text-green-400">{user?.energy ?? 100} / 100</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          Boost Energy
        </button>
      </div>
    </div>
  );
}
