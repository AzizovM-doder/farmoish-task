import { create } from "zustand";
import type { ICategory, IStore, ITodo } from "../types/todo.types";

export const useTodo = create<IStore>()((set, get) => ({
  data: [],
  categories: [],
  loading: false,
  error: null,
  
  fetchData: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(
        "https://6a0702b9c83ba8ad9b3e4bae.mockapi.io/todo/api",
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const dataR = await response.json();
      
      get().categoriesCreater(dataR);
      set({ data: dataR, loading: false });
    } catch (error) {
      const err = error as Error;
      console.error(err);
      set({ error: err.message, loading: false });
    }
  },
  categoriesCreater: (data: ITodo[]) => {
    const categories: ICategory[] = [];
    data.forEach((e) => {
      if (!categories.find((c) => c.categoryID == e.categoryID)) {
        const obj: ICategory = { categoryName: e.categoryName, categoryID: e.categoryID };
        categories.push(obj)
      }
    });
    console.log(categories);
    set({ categories });
  },
  moveTodo: (todoId: string, newCategoryID: number) => {
    set((state) => ({
      data: state.data.map((todo) =>
        todo.id === todoId ? { ...todo, categoryID: newCategoryID } : todo
      ),
    }));
  },
  toggleTodo: async (todoId: string) => {
    const todo = get().data.find((t) => t.id === todoId);
    if (!todo) return;
    
    // Local update for speed
    const newStatus = !todo.status;
    set((state) => ({
      data: state.data.map((t) =>
        t.id === todoId ? { ...t, status: newStatus } : t
      ),
    }));

    try {
      await fetch(
        `https://6a0702b9c83ba8ad9b3e4bae.mockapi.io/todo/api/${todoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...todo, status: newStatus }),
        }
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      // Rollback on error if desired, but user style usually keeps it simple
    }
  },
  reorderCategories: (startIndex: number, endIndex: number) => {
    set((state) => {
      const newCategories = Array.from(state.categories);
      const [removed] = newCategories.splice(startIndex, 1);
      newCategories.splice(endIndex, 0, removed);
      return { categories: newCategories };
    });
  },
}));
