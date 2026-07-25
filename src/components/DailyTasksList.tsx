import DailyTaskCard from "./DailyTaskCard";
import { DailyTask } from "../hooks/useDailyTasks";

type Props = {
  tasks: DailyTask[];
  onComplete: (id: number) => void;
};

export default function DailyTasksList({
  tasks,
  onComplete,
}: Props) {
  return (
    <>
      {tasks.map((task) => (
        <DailyTaskCard
          key={task.id}
          title={task.title}
          reward={task.reward}
          completed={task.completed}
          onComplete={() => onComplete(task.id)}
        />
      ))}
    </>
  );
}
