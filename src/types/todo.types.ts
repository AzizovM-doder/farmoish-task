// /interfaseoi todo
export interface IStore {
  data: ITodo[];
  loading: boolean;
  categories :  ICategory[];
  fetchData: () => void;
  categoriesCreater : (data : ITodo[]) => void;
  moveTodo: (todoId: string, newCategoryID: number) => void;
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
export interface ICategory{
    categoryName : string,
    categoryID : number
}
