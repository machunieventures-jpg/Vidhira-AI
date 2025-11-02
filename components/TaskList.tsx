import React from "react";
import { Task } from "../types";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string, newDueDate: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  if (tasks.length === 0) {
    return <p className="text-center text-gray-500">No tasks yet. Add one!</p>;
  }
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
};

export default TaskList;
