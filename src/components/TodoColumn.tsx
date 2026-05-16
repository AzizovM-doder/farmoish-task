import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { ICategory, ITodo } from "../types/todo.types";
import TodoCard from "./TodoCard";
import { useState } from "react";

interface Props {
  category: ICategory;
  todos: ITodo[];
  index: number;
}

const THEME_MAP: Record<string, string> = {
  "Design": "design",
  "Front-End": "frontend",
  "Back-End": "backend",
  "Testing": "testing"
};

const THEME_LIST = ["design", "frontend", "backend", "testing"];

const TodoColumn = ({ category, todos, index }: Props) => {
  const theme = THEME_MAP[category.categoryName] || THEME_LIST[index % THEME_LIST.length];
  
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(todos.length / itemsPerPage);
  
  const paginatedTodos = todos.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <Draggable draggableId={`column-${category.categoryID}`} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`flex flex-col min-w-[340px] rounded-[24px] p-6 min-h-[700px] transition-all duration-300 column-${theme}`}
          style={{ 
            backgroundColor: "var(--c-bg)",
            ...provided.draggableProps.style 
          }}
        >
          <div 
            {...provided.dragHandleProps}
            className="flex items-center justify-between mb-6 px-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "var(--c-circle)", color: "var(--c-text)" }}>
                {todos.length}
              </div>
              <h2 className="font-bold text-[#1B2559] text-xl tracking-tight">
                {category.categoryName}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <button className="hover:text-gray-600 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <button className="hover:text-gray-600 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
              </button>
            </div>
          </div>

          <Droppable droppableId={category.categoryID.toString()} type="task">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex flex-col gap-4 flex-grow transition-all duration-200 rounded-2xl ${
                  snapshot.isDraggingOver ? "bg-white/30" : ""
                }`}
              >
                {paginatedTodos.map((todo, idx) => (
                  <TodoCard key={todo.id} todo={todo} index={currentPage * itemsPerPage + idx} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {totalPages > 1 && (
            <div className="flex items-center justify-between my-4 px-2">
              <button 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
                className="text-sm font-bold text-gray-500 disabled:opacity-30 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-400">
                {currentPage + 1} / {totalPages}
              </span>
              <button 
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => p + 1)}
                className="text-sm font-bold text-gray-500 disabled:opacity-30 hover:text-gray-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          <button 
            className="mt-2 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed rounded-2xl transition-all hover:bg-white/50"
            style={{ borderColor: "var(--c-accent)", color: "var(--c-text)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span className="font-bold text-sm" style={{ color: "var(--c-text)" }}>Add new task</span>
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default TodoColumn;
