import { useState, useEffect } from "react";
import type { ITodo } from "../types/todo.types";
import { useTodo } from "../store/todo";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  todo: ITodo;
}

const AVATAR_IMAGES = [
  "https://i.pravatar.cc/150?u=1",
  "https://i.pravatar.cc/150?u=2",
  "https://i.pravatar.cc/150?u=3",
  "https://i.pravatar.cc/150?u=4",
  "https://i.pravatar.cc/150?u=5",
];

const EditTaskModal = ({ isOpen, onClose, todo }: Props) => {
  const [title, setTitle] = useState(todo.title);
  const [date, setDate] = useState(todo.date);
  const [selectedAvatar, setSelectedAvatar] = useState(todo.avatar || AVATAR_IMAGES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateTodo } = useTodo();

  useEffect(() => {
    if (isOpen) {
      setTitle(todo.title);
      setDate(todo.date);
      setSelectedAvatar(todo.avatar || AVATAR_IMAGES[0]);
    }
  }, [isOpen, todo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      setIsSubmitting(true);
      try {
        await updateTodo(todo.id, { title, date, avatar: selectedAvatar });
        toast.success("Task updated!");
        onClose();
      } catch (err) {
        toast.error("Failed to update task");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-600">Choose Avatar</p>
            <div className="flex gap-2">
              {AVATAR_IMAGES.map(img => (
                <img 
                  key={img} 
                  src={img}
                  onClick={() => !isSubmitting && setSelectedAvatar(img)}
                  className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all ${selectedAvatar === img ? "border-blue-500 scale-110 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 p-3 font-bold text-gray-500 bg-gray-100 rounded-xl disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 p-3 font-bold text-white bg-blue-500 rounded-xl disabled:bg-blue-300 flex items-center justify-center gap-2">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
