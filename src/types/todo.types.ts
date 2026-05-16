// /interfaseoi todo
export interface IStore {
  data: ITodo[];
  loading: boolean;
  error: string | null;
  updatingTodoId: string | null;
  categories: ICategory[];
  fetchData: (search?: string) => void;
  categoriesCreater: (data: ITodo[]) => void;
  moveTodo: (todoId: string, newCategoryID: number) => void;
  toggleTodo: (todoId: string) => void;
  reorderCategories: (startIndex: number, endIndex: number) => void;
}
export interface ITodo {
  id: string;
  title: string;
  date: string;
  status: boolean;
  categoryName: string;
  categoryID: number;
  avatar: string;
}
export interface ICategory {
  categoryName: string,
  categoryID: number
}
