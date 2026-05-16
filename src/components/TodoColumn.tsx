import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { ICategory } from "../types/todo.types";
import TodoCard from "./TodoCard";
import { useState, useEffect, memo } from "react";
import AddTaskModal from "./AddTaskModal";
import { useTodo } from "../store/todo";

const THEME_MAP: Record<string, string> = {
  "Design": "design",
  "Front-End": "frontend",
  "Back-End": "backend",
  "Testing": "testing"
};

const THEME_LIST = ["design", "frontend", "backend", "testing"];

interface Props {
  category: ICategory;
  index: number;
}

const TodoColumn = memo(({ category, index }: Props) => {
  const { columnData, fetchColumn, data, statusFilter, searchValue } = useTodo();
  const theme = THEME_MAP[category.categoryName] || THEME_LIST[category.categoryID % THEME_LIST.length];
  
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const todos = columnData[category.categoryID] || [];
  
  const totalInCategory = data.filter(t => t.categoryID === category.categoryID).length;
  const totalPages = Math.ceil(totalInCategory / itemsPerPage);

  const loadData = async () => {
    setIsLoading(true);
    await fetchColumn(category.categoryID, currentPage, itemsPerPage);
    setIsLoading(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 400);

    return () => clearTimeout(handler);
  }, [currentPage, category.categoryID, statusFilter, searchValue]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchValue]);

  // If current page becomes empty (due to move/delete), go back one page
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <Draggable draggableId={`column-${category.categoryID}`} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`flex flex-col min-w-[340px] rounded-[24px] p-6 min-h-[700px] transition-all duration-300 column-${theme} ${
            snapshot.isDragging ? "shadow-2xl scale-[1.02] z-50" : ""
          }`}
          style={{ 
            backgroundColor: "var(--c-bg)",
            ...provided.draggableProps.style 
          }}
        >
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(category.categoryName);
  const { updateCategoryName } = useTodo();

  const handleTitleSubmit = async () => {
    if (editedTitle.trim() && editedTitle !== category.categoryName) {
      await updateCategoryName(category.categoryID, editedTitle);
    }
    setIsEditingTitle(false);
  };

  return (
    <Draggable draggableId={`column-${category.categoryID}`} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`flex flex-col min-w-[340px] rounded-[24px] p-6 min-h-[700px] transition-all duration-300 column-${theme} ${
            snapshot.isDragging ? "shadow-2xl scale-[1.02] z-50" : ""
          }`}
          style={{ 
            backgroundColor: "var(--c-bg)",
            ...provided.draggableProps.style 
          }}
        >
          <div 
            {...provided.dragHandleProps}
            className="flex items-center justify-between mb-6 px-1"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: "var(--c-circle)", color: "var(--c-text)" }}>
                {todos.length}
              </div>
              {isEditingTitle ? (
                <input
                  autoFocus
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                  className="bg-white/50 border-none outline-none font-bold text-[#1B2559] text-xl tracking-tight rounded-lg px-2 w-full"
                />
              ) : (
                <h2 
                  onClick={() => setIsEditingTitle(true)}
                  className="font-bold text-[#1B2559] text-xl tracking-tight cursor-pointer hover:bg-white/30 px-2 rounded-lg transition-all truncate"
                >
                  {category.categoryName}
                </h2>
              )}
            </div>
          </div>

          <Droppable droppableId={category.categoryID.toString()} type="task">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex flex-col gap-4 flex-grow transition-all duration-200 rounded-2xl relative ${
                  snapshot.isDraggingOver ? "bg-white/30" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : todos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    <p className="text-xs font-bold mt-2 uppercase tracking-widest">Empty</p>
                  </div>
                ) : (
                  todos.map((todo, idx) => (
                    <TodoCard key={todo.id} todo={todo} index={idx} />
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="flex items-center justify-between my-4 px-2">
            <button 
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(p => p - 1)}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 disabled:opacity-30 hover:text-gray-800 transition-colors"
            >
              {isLoading && currentPage > 1 && <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
              Previous
            </button>
            <span className="text-xs font-bold text-gray-400">
              Page {currentPage} / {totalPages || 1}
            </span>
            <button 
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage(p => p + 1)}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 disabled:opacity-30 hover:text-gray-800 transition-colors"
            >
              Next
              {isLoading && currentPage < totalPages && <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-2 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed rounded-2xl transition-all hover:bg-white/50"
            style={{ borderColor: "var(--c-accent)", color: "var(--c-text)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span className="font-bold text-sm" style={{ color: "var(--c-text)" }}>Add new task</span>
          </button>

          <AddTaskModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            category={category} 
          />
        </div>
      )}
    </Draggable>
  );
});

export default TodoColumn;
