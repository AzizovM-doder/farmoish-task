import { create } from "zustand";
import type { ICategory, IStore, ITodo } from "../types/todo.types";
import axios from "axios";

const API_URL = "https://6a0702b9c83ba8ad9b3e4bae.mockapi.io/todo/api";

export const useTodo = create<IStore>()((set, get) => ({
  data: [],
  categories: [],
  loading: false,
  error: null,
  updatingTodoId: null,
  
  fetchData: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(API_URL);
      const dataR = response.data;
      
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
  moveTodo: async (todoId: string, newCategoryID: number) => {
    const category = get().categories.find(c => c.categoryID === newCategoryID);
    if (!category) return;

    set({ updatingTodoId: todoId });

    set((state) => ({
      data: state.data.map((todo) =>
        todo.id === todoId 
          ? { ...todo, categoryID: newCategoryID, categoryName: category.categoryName } 
          : todo
      ),
    }));

    try {
      const todo = get().data.find(t => t.id === todoId);
      await axios.put(`${API_URL}/${todoId}`, todo);
    } catch (error) {
      console.error("Failed to move todo:", error);
    } finally {
      set({ updatingTodoId: null });
    }
  },
  toggleTodo: async (todoId: string) => {
    const todo = get().data.find((t) => t.id === todoId);
    if (!todo) return;
    
    set({ updatingTodoId: todoId });

    const newStatus = !todo.status;
    set((state) => ({
      data: state.data.map((t) =>
        t.id === todoId ? { ...t, status: newStatus } : t
      ),
    }));

    try {
      await axios.put(`${API_URL}/${todoId}`, { ...todo, status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      set({ updatingTodoId: null });
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
