import type { ITodo } from "../types/todo.types";
import TodoCard from "./TodoCard";

const TodoColumn = ({ data }: { data: ITodo[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {data.map((todo) => (
        <TodoCard key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoColumn;
