import type { ITodo } from "../types/todo.types";

const TodoCard = ({ todo }: { todo: ITodo }) => {
  return (
    <article className="flex flex-col gap-5 p-5 rounded-2xl w-80 h-50 bg-white shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold">{todo.title}</h2>
      <div className="flex items-center justify-between mt-auto">
        <p className="text-sm text-gray-500">{new Date(todo.date).toLocaleDateString()}</p>
        <span className={`px-2 py-1 rounded text-xs ${todo.status ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {todo.status ? 'Completed' : 'Pending'}
        </span>
      </div>
      <p className="text-xs text-gray-400">Category: {todo.categoryName}</p>
    </article>
  );
};

export default TodoCard;
