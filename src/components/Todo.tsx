import { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TodoColumn from "./TodoColumn";
import { useTodo } from "../store/todo";

const Todo = () => {
  const { data, categories, loading, error, fetchData, moveTodo, reorderCategories } = useTodo();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue) console.log("bounce kor kad malades woga");
      fetchData(searchValue);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue, fetchData]);

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

    // Small timeout to allow drag animation to finish before store update
    setTimeout(() => {
      moveTodo(draggableId, Number(destination.droppableId));
    }, 0);
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
    <section className="max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <h1 className="text-3xl font-bold text-gray-800">Todo</h1>
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
          />
          <svg className="absolute left-3 top-2.5 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p className="mt-4 font-bold text-lg">No tasks found</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="board-container">
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex gap-6 items-start"
                >
                  {categories.map((category, index) => (
                    <TodoColumn 
                      key={category.categoryID} 
                      category={category}
                      index={index}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      )}
    </section>
  );
};

export default Todo;
