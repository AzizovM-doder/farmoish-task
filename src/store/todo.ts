import { create } from "zustand";
import type { ICategory, IStore, ITodo } from "../types/todo.types";
import axios from "axios";

const API_URL = "https://6a0702b9c83ba8ad9b3e4bae.mockapi.io/todo/api";

interface ExtendedStore extends IStore {
  columnData: Record<number, ITodo[]>;
  fetchColumn: (categoryId: number, page: number, limit: number) => Promise<void>;
}

export const useTodo = create<ExtendedStore>()((set, get) => ({
  data: [],
  categories: JSON.parse(localStorage.getItem("column_order") || "[]"),
  columnData: {},
  loading: false,
  error: null,
  updatingTodoId: null,
  lastUpdated: Date.now(),
  
  fetchData: async (search?: string) => {
    try {
      set({ loading: true, error: null });
      const url = search ? `${API_URL}?title=${search}` : API_URL;
      const response = await axios.get(url);
      const dataR = response.data;
      
      get().categoriesCreater(dataR);
      set({ data: dataR, loading: false });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        set({ data: [], loading: false, error: null });
        return;
      }
      const err = error as Error;
      set({ error: err.message, loading: false });
    }
  },

  fetchColumn: async (categoryId, page, limit) => {
    try {
      const response = await axios.get(
        `${API_URL}?limit=${limit}&page=${page}&categoryID=${categoryId}`
      );
      set((state) => ({
        columnData: { ...state.columnData, [categoryId]: response.data }
      }));
    } catch (error) {
      console.error("Failed to fetch column:", error);
    }
  },

  categoriesCreater: (data: ITodo[]) => {
    if (get().categories.length > 0) return;
    const categories: ICategory[] = [];
    data.forEach((e) => {
      if (!categories.find((c) => c.categoryID == e.categoryID)) {
        const obj: ICategory = { categoryName: e.categoryName, categoryID: e.categoryID };
        categories.push(obj)
      }
    });
    set({ categories });
    localStorage.setItem("column_order", JSON.stringify(categories));
  },

  moveTodo: async (todoId, newCategoryID) => {
    const category = get().categories.find(c => c.categoryID === newCategoryID);
    if (!category) return;

    const currentTodo = get().data.find(t => t.id === todoId);
    if (!currentTodo) return;
    const oldCategoryID = currentTodo.categoryID;

    // Optimistic UI for both global data and columnData
    set((state) => {
      const updatedData = state.data.map(t => 
        t.id === todoId ? { ...t, categoryID: newCategoryID, categoryName: category.categoryName } : t
      );
      
      // Update columnData optimistically to prevent snap-back
      const sourceCol = state.columnData[oldCategoryID] || [];
      const destCol = state.columnData[newCategoryID] || [];
      const itemToMove = sourceCol.find(t => t.id === todoId) || currentTodo;

      return {
        data: updatedData,
        columnData: {
          ...state.columnData,
          [oldCategoryID]: sourceCol.filter(t => t.id !== todoId),
          [newCategoryID]: [{ ...itemToMove, categoryID: newCategoryID, categoryName: category.categoryName }, ...destCol].slice(0, 3)
        }
      };
    });

    try {
      // Find the fully updated todo object
      const updatedTodo = get().data.find(t => t.id === todoId);
      await axios.put(`${API_URL}/${todoId}`, updatedTodo);
      
      // Instead of refreshing everything, we just sync the global count in background
      const response = await axios.get(API_URL);
      set({ data: response.data });
      
      // Note: We don't trigger lastUpdated here to avoid flickering current pages
    } catch (error) {
      console.error("Move failed:", error);
      // Optional: rollback if error
    }
  },

  toggleTodo: async (todoId) => {
    const todo = get().data.find(t => t.id === todoId);
    if (!todo) return;
    set({ updatingTodoId: todoId });
    const newStatus = !todo.status;

    set((state) => ({
      data: state.data.map(t => t.id === todoId ? { ...t, status: newStatus } : t),
      columnData: Object.fromEntries(
        Object.entries(state.columnData).map(([id, list]) => [
          id,
          list.map(t => t.id === todoId ? { ...t, status: newStatus } : t)
        ])
      )
    }));

    try {
      await axios.put(`${API_URL}/${todoId}`, { ...todo, status: newStatus });
      // Minor sync
      set({ lastUpdated: Date.now() });
    } catch (error) {
      console.error("Toggle failed:", error);
    } finally {
      set({ updatingTodoId: null });
    }
  },

  deleteTodo: async (todoId) => {
    try {
      await axios.delete(`${API_URL}/${todoId}`);
      set((state) => ({
        data: state.data.filter(t => t.id !== todoId),
        columnData: Object.fromEntries(
          Object.entries(state.columnData).map(([id, list]) => [
            id,
            list.filter(t => t.id !== todoId)
          ])
        ),
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  },

  addTodo: async (newTodo) => {
    try {
      const response = await axios.post(API_URL, {
        ...newTodo,
        status: false,
      });
      const added = response.data;
      set((state) => ({
        data: [...state.data, added],
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error("Add failed:", error);
    }
  },

  reorderCategories: (startIndex, endIndex) => {
    set((state) => {
      const newCats = Array.from(state.categories);
      const [removed] = newCats.splice(startIndex, 1);
      newCats.splice(endIndex, 0, removed);
      localStorage.setItem("column_order", JSON.stringify(newCats));
      return { categories: newCats };
    });
  },
}));
