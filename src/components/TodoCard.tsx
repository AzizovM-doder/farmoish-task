import { Draggable } from "@hello-pangea/dnd";
import type { ITodo } from "../types/todo.types";
import { useTodo } from "../store/todo";
import { useState } from "react";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Props {
  todo: ITodo;
  index: number;
}

const TodoCard = ({ todo, index }: Props) => {
  const { toggleTodo, updatingTodoId, deleteTodo } = useTodo();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isUpdating = updatingTodoId === todo.id;

  return (
    <Draggable draggableId={todo.id} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`relative flex flex-col gap-4 p-5 rounded-xl w-full bg-white border border-gray-200 shadow-sm transition-shadow ${
            snapshot.isDragging ? "shadow-xl ring-2 ring-blue-400 border-transparent" : "hover:shadow-md"
          }`}
        >
          {isUpdating && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-lg font-medium text-gray-800 leading-tight ${todo.status ? "line-through text-gray-400" : ""}`}>
              {todo.title}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDeleteOpen(true)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              <input 
                type="checkbox" 
                checked={todo.status} 
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 cursor-pointer rounded-full accent-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              {todo.avatar.startsWith("#") ? (
                <div 
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: todo.avatar }}
                />
              ) : (
                <img src={todo.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
              )}
              <time className="text-xs text-gray-500 font-medium">
                {new Date(todo.date).toLocaleDateString()}
              </time>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              todo.status 
                ? "bg-green-100 text-green-700" 
                : "bg-amber-100 text-amber-700"
            }`}>
              {todo.status ? "Completed" : "Active"}
            </span>
          </div>
          <DeleteConfirmModal 
            isOpen={isDeleteOpen} 
            onClose={() => setIsDeleteOpen(false)} 
            onConfirm={() => deleteTodo(todo.id)} 
            title={todo.title}
          />
        </article>
      )}
    </Draggable>
  );
};

export default TodoCard;
