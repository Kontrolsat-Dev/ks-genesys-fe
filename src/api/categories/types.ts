// src/api/categories/types.ts
export type CategoriesListParams = {
  page?: number;
  pageSize?: number;
  q?: string | null;
  autoImport?: boolean | null;
};

export type Category = {
  id: number;
  name: string;
  // Supplier source
  id_supplier_source: number | null;
  supplier_source_name: string | null;
  // PrestaShop mapping
  id_ps_category: number | null;
  ps_category_name: string | null;
  auto_import: boolean;
};

export type CategoriesListResponse = {
  items: Category[];
  total: number;
  page: number;
  page_size: number;
};

// Mapping types
export type CategoryMappingIn = {
  id_ps_category: number;
  ps_category_name: string;
  auto_import: boolean;
};

export type CategoryMappingOut = Category & {
  updated_at: string | null;
};

