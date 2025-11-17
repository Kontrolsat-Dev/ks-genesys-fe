// src/api/brands/types.ts
export type BrandsListParams = {
  page?: number;
  pageSize?: number;
  q?: string | null;
};

export type Brand = {
  id: number;
  name: string;
};

export type BrandsListResponse = {
  items: Brand[];
  total: number;
  page: number;
  page_size: number;
};
