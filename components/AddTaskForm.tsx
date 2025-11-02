import React, { useState } from "react";

interface AddTaskFormProps {
  onAddTask: (task: { text: string; dueDate: string }) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({ text: taskText, dueDate });
    setTaskText("");
    setDueDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          placeholder="What needs to be done?"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <input
          type="date"
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
      >
        Add Task
      </button>
    </form>
  );
};

export default AddTaskForm;
