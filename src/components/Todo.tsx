import { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import TodoColumn from "./TodoColumn";
import { useTodo } from "../store/todo";

const Todo = () => {
  const { data, categories, fetchData, moveTodo, reorderCategories, statusFilter, setStatusFilter, searchValue, setSearchValue, error, loading, addColumn } = useTodo();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "column") {
      reorderCategories(source.index, destination.index);
      return;
    }

    moveTodo(draggableId, Number(destination.droppableId));
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim());
      setNewColumnName("");
      setIsAddingColumn(false);
    }
  };

  return (
    <section className="max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <div>
          <h1 className="text-3xl font-bold text-[#1B2559]">Todo</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-sm"
            />
            <svg className="absolute left-3 top-3.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40 px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-sm font-bold text-[#1B2559] cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading && data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <div className="w-16 h-16 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 font-bold text-gray-500 animate-pulse">Initializing Board...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[50vh] px-4 text-center bg-red-50/30 rounded-[32px] border-2 border-dashed border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 className="text-xl font-bold text-[#1B2559] mb-1">Board Sync Error</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-6">{error}</p>
          <button 
            onClick={() => fetchData()} 
            className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
          >
            Try Again
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start"
              >
                {categories.map((category, index) => (
                  <TodoColumn 
                    key={category.categoryID} 
                    category={category}
                    index={index}
                  />
                ))}
                {provided.placeholder}

                {/* Add Column Section */}
                <div className="min-w-[340px] p-2">
                  {isAddingColumn ? (
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-200">
                      <input
                        autoFocus
                        placeholder="Column name..."
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                        className="w-full p-3 border rounded-xl mb-3 outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setIsAddingColumn(false)} className="flex-1 py-2 bg-gray-50 text-gray-500 rounded-lg font-bold text-sm">Cancel</button>
                        <button onClick={handleAddColumn} className="flex-1 py-2 bg-[#4318FF] text-white rounded-lg font-bold text-sm">Add</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingColumn(true)}
                      className="w-full py-12 border-2 border-dashed border-gray-200 rounded-[24px] text-gray-400 hover:text-[#4318FF] hover:border-[#4318FF] hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-all">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </div>
                      <span className="font-bold">Add New Column</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </section>
  );
};
export default Todo;
