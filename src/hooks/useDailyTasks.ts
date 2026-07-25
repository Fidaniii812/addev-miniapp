import { useState } from "react";

export type DailyTask = {
  id: number;
  title: string;
  reward: number;
  completed: boolean;
};

export default function useDailyTasks() {
  const [tasks, setTasks] = useState<DailyTask[]>([
    {
      id: 1,
      title: "Open Mini App",
      reward: 10,
      completed: false,
    },
    {
      id: 2,
      title: "Watch an Ad",
      reward: 20,
      completed: false,
    },
    {
      id: 3,
      title: "Invite a Friend",
      reward: 50,
      completed: false,
    },
  ]);

  const completeTask = (id: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: true }
          : task
      )
    );
  };

  return {
    tasks,
    completeTask,
  };
}
