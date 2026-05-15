import { useEffect } from "react";
import TodoColumn from "./TodoColumn";
import { useTodo } from "../store/todo";

const Todo = () => {
  const { data, loading, fetchData } = useTodo();
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <section className="max-w-7xl m-auto p-5">
      <h1>Todo</h1>
      <div>
        {loading ? (
          <div className="flex justify-center items-center">
            <p>loading...</p>
          </div>
        ) : (
          <TodoColumn data={data} />  
        )}
      </div>
    </section>
  );
};

export default Todo;
