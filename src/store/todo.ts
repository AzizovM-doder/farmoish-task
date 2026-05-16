import { create } from "zustand";
import type { ICategory, IStore, ITodo } from "../types/todo.types";
import axios from "axios";

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
}

export const useTodo = create<ExtendedStore>()((set, get) => ({
  data: [],
  categories: JSON.parse(localStorage.getItem("column_order") || "[]"),
  columnData: {},
  loading: false,
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
    try {
      const { searchValue, statusFilter } = get();
      const res = await axios.get(`${API_URL}?limit=100`);
      let list = res.data;
      if (searchValue) {
        list = list.filter((t: ITodo) => t.title.toLowerCase().includes(searchValue.toLowerCase()));
      }
      if (statusFilter !== "all") {
        list = list.filter((t: ITodo) => t.status === (statusFilter === "completed"));
      }
      get().categoriesCreater(list);
      set({ data: list });
    } catch (e) { console.error(e); }
  },

  fetchColumn: async (categoryId, page, limit) => {
    try {
      const { statusFilter, searchValue } = get();
      const res = await axios.get(`${API_URL}?categoryID=${categoryId}&limit=100`);
      let list = res.data;
      if (searchValue) {
        list = list.filter((t: ITodo) => t.title.toLowerCase().includes(searchValue.toLowerCase()));
      }
      if (statusFilter !== "all") {
        list = list.filter((t: ITodo) => t.status === (statusFilter === "completed"));
      }
      const paginated = list.slice((page - 1) * limit, page * limit);
      set((state) => ({ columnData: { ...state.columnData, [categoryId]: paginated } }));
    } catch (e) { console.error(e); }
  },

  categoriesCreater: (data) => {
    if (get().categories.length > 0) return;
    const cats: ICategory[] = [];
    data.forEach((e) => {
      if (!cats.find((c) => c.categoryID == e.categoryID)) {
        cats.push({ categoryName: e.categoryName, categoryID: e.categoryID });
      }
    });
    if (cats.length > 0) {
      set({ categories: cats });
      localStorage.setItem("column_order", JSON.stringify(cats));
    }
  },

  updateTodo: async (todoId, updates) => {
    const { data, columnData } = get();
    const todo = data.find(t => t.id === todoId);
    if (!todo) return;
    const updated = { ...todo, ...updates };
    
    // Optimistic UI
    set({
      data: data.map(t => t.id === todoId ? updated : t),
      columnData: Object.fromEntries(
        Object.entries(columnData).map(([id, list]) => [
          id, list.map(t => t.id === todoId ? updated : t)
        ])
      )
    });

    try {
      await axios.put(`${API_URL}/${todoId}`, updated);
      await get().fetchData();
    } catch (e) { console.error(e); }
  },

  updateCategoryName: async (categoryId, newName) => {
    const { categories, data } = get();
    // Update local categories
    const newCats = categories.map(c => c.categoryID === categoryId ? { ...c, categoryName: newName } : c);
    set({ categories: newCats });
    localStorage.setItem("column_order", JSON.stringify(newCats));

    // Update all tasks in this category
    const tasksToUpdate = data.filter(t => t.categoryID === categoryId);
    try {
      await Promise.all(tasksToUpdate.map(t => 
        axios.put(`${API_URL}/${t.id}`, { ...t, categoryName: newName })
      ));
      await get().fetchData();
    } catch (e) { console.error(e); }
  },

  moveTodo: async (todoId, newCategoryID) => {
    const { categories, data, columnData } = get();
    const cat = categories.find(c => c.categoryID === newCategoryID);
    const todo = data.find(t => t.id === todoId);
    if (!cat || !todo) return;
    const oldID = todo.categoryID;
    const updated = { ...todo, categoryID: newCategoryID, categoryName: cat.categoryName };

    set({
      data: data.map(t => t.id === todoId ? updated : t),
      columnData: {
        ...columnData,
        [oldID]: (columnData[oldID] || []).filter(t => t.id !== todoId),
        [newCategoryID]: [updated, ...(columnData[newCategoryID] || [])].slice(0, 3)
      }
    });

    try {
      await axios.put(`${API_URL}/${todoId}`, updated);
      await get().fetchData();
    } catch (e) { console.error(e); }
  },

  toggleTodo: async (todoId) => {
    const { data, columnData, statusFilter } = get();
    const todo = data.find(t => t.id === todoId);
    if (!todo) return;
    set({ updatingTodoId: todoId });
    const nextStatus = !todo.status;
    const updated = { ...todo, status: nextStatus };

    set({
      data: data.map(t => t.id === todoId ? updated : t),
      columnData: Object.fromEntries(Object.entries(columnData).map(([id, list]) => {
        let newList = list.map(t => t.id === todoId ? updated : t);
        if (statusFilter !== "all") newList = newList.filter(t => t.status === (statusFilter === "completed"));
        return [id, newList];
      }))
    });

    try {
      await axios.put(`${API_URL}/${todoId}`, updated);
      await get().fetchData();
    } catch (e) { console.error(e); } finally {
      set({ updatingTodoId: null });
    }
  },

  deleteTodo: async (todoId) => {
    try {
      await axios.delete(`${API_URL}/${todoId}`);
      const { data, columnData } = get();
      set({
        data: data.filter(t => t.id !== todoId),
        columnData: Object.fromEntries(Object.entries(columnData).map(([id, list]) => [id, list.filter(t => t.id !== todoId)]))
      });
      await get().fetchData();
    } catch (e) { console.error(e); }
  },

  addTodo: async (todo) => {
    try {
      const res = await axios.post(API_URL, { ...todo, status: false });
      set({ data: [...get().data, res.data] });
      await get().fetchData();
    } catch (e) { console.error(e); }
  },

  reorderCategories: (start, end) => {
    const cats = [...get().categories];
    const [item] = cats.splice(start, 1);
    cats.splice(end, 0, item);
    set({ categories: cats });
    localStorage.setItem("column_order", JSON.stringify(cats));
  },
}));
