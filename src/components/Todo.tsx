import { useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TodoColumn from "./TodoColumn";
import { useTodo } from "../store/todo";

const Todo = () => {
  const { categories, fetchData, moveTodo, reorderCategories, statusFilter, setStatusFilter, searchValue, setSearchValue, error } = useTodo();

  useEffect(() => {
    // Initial fetch to populate categories if empty
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

    // Small timeout to allow drag animation to finish before store update
    setTimeout(() => {
      moveTodo(draggableId, Number(destination.droppableId));
    }, 0);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p className="mt-4 font-bold text-xl">{error}</p>
        <button onClick={() => fetchData()} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all">Try again</button>
      </div>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <h1 className="text-3xl font-bold text-gray-800">Todo Board</h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-sm"
            />
            <svg className="absolute left-3 top-3.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40 px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-sm font-bold text-gray-600 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
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
    </section>
  );
};

export default Todo;
