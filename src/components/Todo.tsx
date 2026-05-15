import { useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TodoColumn from "./TodoColumn";
import { useTodo } from "../store/todo";

const Todo = () => {
  const { data, categories, loading, fetchData, moveTodo, reorderCategories } = useTodo();

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

    moveTodo(Number(draggableId), Number(destination.droppableId));
  };

  return (
    <section className="max-w-[1600px] mx-auto p-8">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Board</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
