import type { ProductOut } from "@/api/products";

type OfferOut = {
  id_supplier: number;
  supplier_name?: string | null;
  supplier_image?: string | null;
  price?: string | null;
  stock?: number | null;
  updated_at?: string | null;
};

type ProductExt = ProductOut & {
  brand_name?: string | null;
  category_name?: string | null;
  offers?: OfferOut[];
  best_offer?: OfferOut | null;
  id_ecommerce?: number | null;
};

export type { ProductExt, OfferOut };
