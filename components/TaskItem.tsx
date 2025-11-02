import React, { useState } from "react";
import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string, newDueDate: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate || "");

  const handleSave = () => {
    onUpdate(task.id, editedText, editedDueDate);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(task.text);
    setEditedDueDate(task.dueDate || "");
    setIsEditing(false);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // Adding T00:00:00 ensures the date is parsed in the local timezone, not UTC
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate).setHours(23, 59, 59, 999) < Date.now() && !task.completed;


  if (isEditing) {
    return (
      <li className="flex flex-col sm:flex-row items-center p-3 bg-gray-50 rounded-lg border">
        <div className="flex-grow w-full mb-2 sm:mb-0 sm:mr-2">
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
            />
            <input
              type="date"
              className="w-full p-2 border rounded-lg mt-2"
              value={editedDueDate}
              onChange={(e) => setEditedDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center p-3 rounded-lg transition-colors ${
        task.completed ? "bg-green-50 text-gray-500" : "bg-white"
      }`}
    >
      <input
        type="checkbox"
        className="h-6 w-6 mr-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <div className="flex-grow">
        <span className={`${task.completed ? "line-through" : ""}`}>{task.text}</span>
        {task.dueDate && (
             <p className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                Due: {formatDate(task.dueDate)}
             </p>
        )}
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
