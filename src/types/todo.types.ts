// /interfaseoi todo
export interface IStore {
  data: ITodo[];
  loading: boolean;
  categories :  ICategory[];
  fetchData: () => void;
  categoriesCreater : (data : ITodo[]) => void;
  moveTodo: (todoId: number, newCategoryID: number) => void;
  reorderCategories: (startIndex: number, endIndex: number) => void;
}
export interface ITodo {
  id: number;
  title: string;
  date: Date;
  status: boolean;
  categoryName: string;
  categoryID: number;
}
export interface ICategory{
    categoryName : string,
    categoryID : number
}
