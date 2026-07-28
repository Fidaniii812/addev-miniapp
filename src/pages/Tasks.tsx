import React, { useState, useEffect } from 'react';

// Detyrat e pastra me linkat e tua zyrtare
const initialTasks = [
  {
    id: 'task_join_major',
    title: 'Join Major App',
    description: 'Check Major Telegram bot',
    reward: 100,
    link: 'https://t.me/major/start?startapp=8508477699'
  },
  {
    id: 'task_visit_studio',
    title: 'Visit AdDev Studio',
    description: 'Discover addev-studio.com',
    reward: 50,
    link: 'https://addev-studio.com'
  },
  {
    id: 'task_explore_app',
    title: 'Explore AdDev Mini App',
    description: 'Check out our main platform version',
    reward: 50,
    link: 'https://addev-miniapp.vercel.app/'
  }
];

export default function Tasks({ userTelegramId, onRewardEarned }) {
  const [completedTasks, setCompletedTasks] = useState([]);

  // Ngarko detyrat e përfunduara nga localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`completed_tasks_${userTelegramId}`);
    if (saved) {
      setCompletedTasks(JSON.parse(saved));
    }
  }, [userTelegramId]);

  const handleCompleteTask = (task) => {
    // Hap linkun në një tab të ri
    window.open(task.link, '_blank');

    // Nëse nuk është kryer më parë, ruaje si e përfunduar
    if (!completedTasks.includes(task.id)) {
      const updated = [...completedTasks, task.id];
      setCompletedTasks(updated);
      localStorage.setItem(`completed_tasks_${userTelegramId}`, JSON.stringify(updated));
      
      // Shto shpërblimin te bilanci
      onRewardEarned(task.reward);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">Tasks & Partner Deals</h2>
      <div className="space-y-3">
        {initialTasks.map((task) => {
          const isCompleted = completedTasks.includes(task.id);
          return (
            <div key={task.id} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">{task.title}</h3>
                <p className="text-sm text-gray-400">{task.description}</p>
                <span className="text-green-400 text-sm font-medium">+{task.reward} ADC</span>
              </div>
              <button
                onClick={() => handleCompleteTask(task)}
                disabled={isCompleted}
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  isCompleted 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isCompleted ? 'Completed' : 'Start'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
