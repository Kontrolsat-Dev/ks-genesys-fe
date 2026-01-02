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
  // Fornecedor de origem
  id_supplier_source: number | null;
  supplier_source_name: string | null;
  // Mapeamento PrestaShop
  id_ps_category: number | null;
  ps_category_name: string | null;
  auto_import: boolean;
  // Taxas default para produtos desta categoria
  default_ecotax: number;
  default_extra_fees: number;
};

export type CategoriesListResponse = {
  items: Category[];
  total: number;
  page: number;
  page_size: number;
};

// Tipos de mapeamento
export type CategoryMappingIn = {
  id_ps_category: number;
  ps_category_name: string;
  auto_import: boolean;
  default_ecotax?: number | null;
  default_extra_fees?: number | null;
};

export type CategoryMappingOut = Category & {
  updated_at: string | null;
};

