import { create } from "zustand";
import type { ICategory, IStore, ITodo } from "../types/todo.types";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "https://6a0702b9c83ba8ad9b3e4bae.mockapi.io/todo/api";

interface ExtendedStore extends IStore {
  statusFilter: string;
  searchValue: string;
  setStatusFilter: (filter: string) => void;
  setSearchValue: (search: string) => void;
  columnData: Record<number, ITodo[]>;
  fetchColumn: (categoryId: number, page: number, limit: number) => Promise<void>;
  updateTodo: (todoId: string, updates: Partial<ITodo>) => Promise<void>;
  updateCategoryName: (categoryId: number, newName: string) => Promise<void>;
  addColumn: (name: string) => Promise<void>;
  deleteColumn: (categoryId: number) => Promise<void>;
}

export const useTodo = create<ExtendedStore>()((set, get) => ({
  data: [],
  categories: JSON.parse(localStorage.getItem("column_order") || "[]"),
  columnData: {},
  loading: true,
  error: null,
  updatingTodoId: null,
  lastUpdated: Date.now(),
  statusFilter: "all",
  searchValue: "",

  setStatusFilter: (filter) => {
    set({ statusFilter: filter, lastUpdated: Date.now() });
    get().fetchData();
  },
  setSearchValue: (search) => {
    set({ searchValue: search, lastUpdated: Date.now() });
    get().fetchData();
  },
  
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const { searchValue, statusFilter } = get();
      const res = await axios.get(`${API_URL}?limit=100`);
      let list = res.data;
      
      if (!Array.isArray(list)) {
        throw new Error("Invalid response from server");
      }

      list = list.map((t: ITodo) => ({ ...t, categoryID: Number(t.categoryID) }));
      
      if (searchValue) {
        list = list.filter((t: ITodo) => t.title.toLowerCase().includes(searchValue.toLowerCase()));
      }
      if (statusFilter !== "all") {
        list = list.filter((t: ITodo) => t.status === (statusFilter === "completed"));
      }
      
      get().categoriesCreater(list);
      set({ data: list, loading: false });
    } catch (e) { 
      console.error(e);
      set({ error: "Failed to connect to the server. Please check your connection.", loading: false });
    }
  },

  fetchColumn: async (categoryId, page, limit) => {
    const { data } = get();
    const list = data.filter(t => Number(t.categoryID) === Number(categoryId));
    const paginated = list.slice((page - 1) * limit, page * limit);
    set((state) => ({ columnData: { ...state.columnData, [categoryId]: paginated } }));
  },

  categoriesCreater: (data) => {
    // If no data, clear categories to satisfy "no columns when no data"
    if (data.length === 0) {
      set({ categories: [] });
      localStorage.removeItem("column_order");
      return;
    }

    if (get().categories.length > 0) return;
    const cats: ICategory[] = [];
    data.forEach((e) => {
      const id = Number(e.categoryID);
      if (!cats.find((c) => Number(c.categoryID) === id)) {
        cats.push({ categoryName: e.categoryName, categoryID: id });
      }
    });
    if (cats.length > 0) {
      set({ categories: cats });
      localStorage.setItem("column_order", JSON.stringify(cats));
    }
  },

  updateTodo: async (todoId, updates) => {
    const { data } = get();
    const todo = data.find(t => t.id === todoId);
    if (!todo) return;
    const updated = { ...todo, ...updates };
    try {
      await axios.put(`${API_URL}/${todoId}`, updated);
      await get().fetchData();
    } catch (e) { 
      toast.error("Failed to update task");
      throw e; 
    }
  },

  updateCategoryName: async (categoryId, newName) => {
    const { categories, data } = get();
    const newCats = categories.map(c => Number(c.categoryID) === Number(categoryId) ? { ...c, categoryName: newName } : c);
    set({ categories: newCats });
    localStorage.setItem("column_order", JSON.stringify(newCats));
    const tasksToUpdate = data.filter(t => Number(t.categoryID) === Number(categoryId));
    try {
      await Promise.all(tasksToUpdate.map(t => axios.put(`${API_URL}/${t.id}`, { ...t, categoryName: newName })));
      toast.success("Column name updated!");
      await get().fetchData();
    } catch (e) { console.error(e); }
  },

  addColumn: async (name) => {
    const { categories } = get();
    const newID = categories.length > 0 ? Math.max(...categories.map(c => c.categoryID)) + 1 : 1;
    const newCat = { categoryName: name, categoryID: newID };
    const updated = [...categories, newCat];
    set({ categories: updated });
    localStorage.setItem("column_order", JSON.stringify(updated));
    try {
      await axios.post(API_URL, {
        title: `Welcome to ${name}!`,
        date: new Date().toISOString().split('T')[0],
        avatar: "https://i.pravatar.cc/150?u=99",
        categoryID: newID,
        categoryName: name,
        status: false
      });
      toast.success(`Column "${name}" created`);
      await get().fetchData();
    } catch (e) {
      toast.error("Failed to create column");
    }
  },

  deleteColumn: async (categoryId) => {
    const { categories, data } = get();
    const cat = categories.find(c => Number(c.categoryID) === Number(categoryId));
    if (!cat) return;

    const newCats = categories.filter(c => Number(c.categoryID) !== Number(categoryId));
    set({ categories: newCats });
    localStorage.setItem("column_order", JSON.stringify(newCats));

    const tasksToDelete = data.filter(t => Number(t.categoryID) === Number(categoryId));
    try {
      await Promise.all(tasksToDelete.map(t => axios.delete(`${API_URL}/${t.id}`)));
      toast.success(`Column "${cat.categoryName}" deleted`);
      await get().fetchData();
    } catch (e) {
      toast.error("Failed to delete column tasks");
    }
  },

  moveTodo: async (todoId, newCategoryID) => {
    const { categories, data, columnData } = get();
    const cat = categories.find(c => Number(c.categoryID) === Number(newCategoryID));
    const todo = data.find(t => t.id === todoId);
    if (!cat || !todo) return;
    const oldID = Number(todo.categoryID);
    const targetID = Number(newCategoryID);
    if (oldID === targetID) return;
    const updated = { ...todo, categoryID: targetID, categoryName: cat.categoryName };
    set({
      data: data.map(t => t.id === todoId ? updated : t),
      columnData: {
        ...columnData,
        [oldID]: (columnData[oldID] || []).filter(t => t.id !== todoId),
        [targetID]: [updated, ...(columnData[targetID] || []).filter(t => t.id !== todoId)].slice(0, 3)
      }
    });
    try {
      await axios.put(`${API_URL}/${todoId}`, updated);
      get().fetchData();
    } catch (e) { 
      toast.error("Failed to move task. Rolling back...");
      get().fetchData();
      console.error("Move failed", e); 
    }
  },

  toggleTodo: async (todoId) => {
    const { data } = get();
    const todo = data.find(t => t.id === todoId);
    if (!todo) return;
    set({ updatingTodoId: todoId });
    const nextStatus = !todo.status;
    const updated = { ...todo, status: nextStatus };
    try {
      await axios.put(`${API_URL}/${todoId}`, updated);
      toast.success(nextStatus ? "Marked as Done" : "Marked as Todo");
      await get().fetchData();
    } catch (e) { toast.error("Update failed"); } finally {
      set({ updatingTodoId: null });
    }
  },

  deleteTodo: async (todoId) => {
    try {
      await axios.delete(`${API_URL}/${todoId}`);
      toast.success("Task deleted");
      await get().fetchData();
    } catch (e) { toast.error("Delete failed"); }
  },

  addTodo: async (todo) => {
    try {
      await axios.post(API_URL, { ...todo, status: false });
      await get().fetchData();
    } catch (e) { 
      toast.error("Failed to add task");
      throw e; 
    }
  },

  reorderCategories: (start, end) => {
    const cats = [...get().categories];
    const [item] = cats.splice(start, 1);
    cats.splice(end, 0, item);
    set({ categories: cats });
    localStorage.setItem("column_order", JSON.stringify(cats));
    toast.success("Columns reordered");
  },
}));
