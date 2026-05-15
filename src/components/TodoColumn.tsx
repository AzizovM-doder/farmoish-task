import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { ICategory, ITodo } from "../types/todo.types";
import TodoCard from "./TodoCard";

interface Props {
  category: ICategory;
  todos: ITodo[];
  index: number;
}

const TodoColumn = ({ category, todos, index }: Props) => {
  return (
    <Draggable draggableId={`column-${category.categoryID}`} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="flex flex-col min-w-[320px] bg-gray-100/50 rounded-xl p-4 min-h-[500px]"
        >
          <div 
            {...provided.dragHandleProps}
            className="flex items-center justify-between mb-4 px-2 cursor-grab active:cursor-grabbing"
          >
            <h2 className="font-semibold text-gray-700 uppercase text-sm tracking-wider">
              {category.categoryName}
            </h2>
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
              {todos.length}
            </span>
          </div>

          <Droppable droppableId={category.categoryID.toString()} type="task">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex flex-col gap-3 min-h-[150px] transition-colors duration-200 rounded-lg ${
                  snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                }`}
              >
                {todos.map((todo, index) => (
                  <TodoCard key={todo.id} todo={todo} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

export default TodoColumn;
