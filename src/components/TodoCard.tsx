import { Draggable } from "@hello-pangea/dnd";
import type { ITodo } from "../types/todo.types";
import { useTodo } from "../store/todo";
import { useState } from "react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import EditTaskModal from "./EditTaskModal";

interface Props {
  todo: ITodo;
  index: number;
}

const TodoCard = ({ todo, index }: Props) => {
  const { toggleTodo, updatingTodoId, deleteTodo } = useTodo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const colors = ["#4318FF", "#6AD2FF", "#FFB547", "#39B54A", "#FF5B5B"];
  const bgColor = colors[Number(todo.id) % colors.length];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    const today = new Date();
    
    const isToday = date.getFullYear() === today.getFullYear() &&
                    date.getMonth() === today.getMonth() &&
                    date.getDate() === today.getDate();
    
    if (isToday) return "Today";
    
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <Draggable draggableId={todo.id} index={index}>
        {(provided, snapshot) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-all duration-200 relative group ${
              snapshot.isDragging ? "shadow-2xl scale-[1.05] border-blue-200 z-50" : "hover:shadow-md hover:border-gray-200"
            } ${updatingTodoId === todo.id ? "opacity-70 pointer-events-none" : ""}`}
          >
            {updatingTodoId === todo.id && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-3xl z-10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <h3 className={`font-bold text-[#1B2559] text-lg leading-tight flex-1 pr-8 transition-all ${todo.status ? "line-through opacity-50" : ""}`}>
                {todo.title}
              </h3>
              
              <div className="absolute right-3 top-4">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-2xl shadow-xl z-[60] py-2">
                    <button 
                      onClick={() => { setIsEditModalOpen(true); setIsMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => { setIsDeleteModalOpen(true); setIsMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                {todo.avatar && todo.avatar.startsWith("http") ? (
                  <img 
                    src={todo.avatar} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm" 
                    style={{ backgroundColor: (todo.avatar && todo.avatar.startsWith("#")) ? todo.avatar : bgColor }}
                  >
                    {todo.title.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-400 ml-1">{formatDate(todo.date)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.status}
                  onChange={() => toggleTodo(todo.id)}
                  disabled={updatingTodoId === todo.id}
                  className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                />
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  todo.status ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                }`}>
                  {todo.status ? "Done" : "Todo"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          await deleteTodo(todo.id);
        }}
        title={todo.title}
      />

      <EditTaskModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        todo={todo}
      />
    </>
  );
};

export default TodoCard;
