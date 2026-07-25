import DailyTasksList from "../components/DailyTasksList";
import DailyRewardsCard from "../components/DailyRewardsCard";

import useDailyTasks from "../hooks/useDailyTasks";
import useDailyRewards from "../hooks/useDailyRewards";

export default function TasksPage() {
  const { tasks, completeTask } = useDailyTasks();

  const {
    totalRewards,
    completedTasks,
  } = useDailyRewards(tasks);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📋 Daily Tasks</h1>

      <DailyRewardsCard
        totalRewards={totalRewards}
        completedTasks={completedTasks}
      />

      <DailyTasksList
        tasks={tasks}
        onComplete={completeTask}
      />
    </div>
  );
}
