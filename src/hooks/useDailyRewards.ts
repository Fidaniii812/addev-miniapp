import { useMemo } from "react";
import { DailyTask } from "./useDailyTasks";

export default function useDailyRewards(tasks: DailyTask[]) {
  const totalRewards = useMemo(
    () =>
      tasks
        .filter((task) => task.completed)
        .reduce((sum, task) => sum + task.reward, 0),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  return {
    totalRewards,
    completedTasks,
  };
}
