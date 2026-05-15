import { Draggable } from "@hello-pangea/dnd";
import type { ITodo } from "../types/todo.types";

interface Props {
  todo: ITodo;
  index: number;
}

const TodoCard = ({ todo, index }: Props) => {
  return (
    <Draggable draggableId={todo.id.toString()} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`flex flex-col gap-4 p-5 rounded-xl w-full bg-white border border-gray-200 shadow-sm transition-shadow ${
            snapshot.isDragging ? "shadow-xl ring-2 ring-blue-400 border-transparent" : "hover:shadow-md"
          }`}
        >
          <h3 className="text-lg font-medium text-gray-800 leading-tight">
            {todo.title}
          </h3>
          
          <div className="flex items-center justify-between mt-auto">
            <time className="text-xs text-gray-500 font-medium">
              {new Date(todo.date).toLocaleDateString()}
            </time>
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              todo.status 
                ? "bg-green-100 text-green-700" 
                : "bg-amber-100 text-amber-700"
            }`}>
              {todo.status ? "Completed" : "Active"}
            </span>
          </div>
        </article>
      )}
    </Draggable>
  );
};

export default TodoCard;
