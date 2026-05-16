import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { ICategory, ITodo } from "../types/todo.types";
import TodoCard from "./TodoCard";

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

  return (
    <Draggable draggableId={`column-${category.categoryID}`} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`flex flex-col min-w-[320px] rounded-2xl p-4 min-h-[600px] column-${theme}`}
          style={{ 
            backgroundColor: "var(--c-bg)",
            ...provided.draggableProps.style 
          }}
        >
          <div 
            {...provided.dragHandleProps}
            className="flex items-center justify-between mb-4 px-2"
          >
            <div className="flex items-center gap-2">
              <span 
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "var(--c-circle)", color: "var(--c-text)" }}
              >
                {todos.length}
              </span>
              <h2 className="font-bold text-gray-800 text-lg">
                {category.categoryName}
              </h2>
            </div>
          </div>

          <Droppable droppableId={category.categoryID.toString()} type="task">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex flex-col gap-3 min-h-[150px] transition-colors duration-200 rounded-lg ${
                  snapshot.isDraggingOver ? "bg-white/40" : ""
                }`}
              >
                {todos.map((todo, index) => (
                  <TodoCard key={todo.id} todo={todo} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <button 
            className="mt-4 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed rounded-2xl transition-all hover:bg-white/50"
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
