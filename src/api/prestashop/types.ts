// src/api/prestashop/types.ts
export type PrestashopCategoryNode = {
  id_category: number;
  id_parent: number;
  name: string;
  level_depth: number;
  active: boolean;
  position: number;
  children: PrestashopCategoryNode[];
};

export type PrestashopCategoriesResponse = {
  root_category_id: number;
  language_id: number;
  shop_id: number;
  categories: PrestashopCategoryNode[];
};
