import { useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TodoColumn from "./TodoColumn";
import { useTodo } from "../store/todo";

const Todo = () => {
  const { data, categories, loading, error, fetchData, moveTodo, reorderCategories } = useTodo();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      reorderCategories(source.index, destination.index);
      return;
    }

    moveTodo(draggableId, Number(destination.droppableId));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-500 font-bold text-xl">{error}</p>
        <button 
          onClick={() => fetchData()} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto p-8">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Board</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-6 overflow-x-auto pb-4 items-start"
              >
                {categories.map((category, index) => (
                  <TodoColumn 
                    key={category.categoryID} 
                    category={category}
                    index={index}
                    todos={data.filter(t => t.categoryID === category.categoryID)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </section>
  );
};

export default Todo;
