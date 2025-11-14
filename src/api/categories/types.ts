// src/api/categories/types.ts
export type CategoriesListParams = {
  page?: number;
  pageSize?: number;
  q?: string | null;
};

export type Category = {
  id: number;
  name: string;
};

export type CategoriesListResponse = {
  items: Category[];
  total: number;
  page: number;
  page_size: number;
};
