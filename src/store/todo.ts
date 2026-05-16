import { create } from "zustand";
import type { ICategory, IStore, ITodo } from "../types/todo.types";
export const useTodo = create<IStore>()((set, get) => ({
  data: [],
  categories: [],
  loading: true,
  
  fetchData: async () => {
    try {
      const response = await fetch(
        "https://6a0702b9c83ba8ad9b3e4bae.mockapi.io/todo/api",
      );
      const dataR = await response.json();
      
      // Update logic if needed, but keeping user's style
      get().categoriesCreater(dataR);
      set({ data: dataR, loading: false });
    } catch (error) {
      console.error(error);
    }
  },
  categoriesCreater: (data: ITodo[]) => {
    const categories : ICategory[] = [];
    data.forEach((e) => {
      if (!categories.find((c) => c.categoryID == e.categoryID)) {
        const obj : ICategory = { categoryName: e.categoryName, categoryID: e.categoryID };
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
  reorderCategories: (startIndex: number, endIndex: number) => {
    set((state) => {
      const newCategories = Array.from(state.categories);
      const [removed] = newCategories.splice(startIndex, 1);
      newCategories.splice(endIndex, 0, removed);
      return { categories: newCategories };
    });
  },
}));
