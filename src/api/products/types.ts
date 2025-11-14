// --- LISTAGEM ---
export type ProductListParams = {
  page?: number;
  pageSize?: number; // envia como page_size
  q?: string | null;
  gtin?: string | null;
  partnumber?: string | null;
  id_brand?: number | null;
  brand?: string | null;
  id_category?: number | null;
  category?: string | null;
  has_stock?: boolean | null;
  id_supplier?: number | null;
  sort?: "recent" | "name" | "cheapest";
};

export type OfferOut = {
  id_supplier: number;
  supplier_name?: string | null;
  supplier_image?: string | null;

  id_feed?: number | null;
  sku?: string | null;

  price?: string | null;
  stock?: number | null;
  id_last_seen_run?: number | null;
  updated_at?: string | null;
};

export type ProductOut = {
  id: number;
  gtin?: string | null;
  id_brand?: number | null;
  id_ecommerce?: number | null;
  brand_name?: string | null;
  id_category?: number | null;
  category_name?: string | null;
  partnumber?: string | null;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  weight_str?: string | null;
  created_at?: string;
  updated_at?: string | null;

  offers?: OfferOut[];
  best_offer?: OfferOut | null;
};

export type ProductListResponse = {
  items: ProductOut[];
  total: number;
  page: number;
  page_size: number;
};

export type ProductExt = ProductOut & {
  brand_name?: string | null;
  category_name?: string | null;
  offers?: OfferOut[];
  best_offer?: OfferOut | null;
  id_ecommerce?: number | null;
};

// --- DETALHE ---
export type ProductMetaOut = {
  name: string;
  value: string;
  created_at: string;
};

export type ProductStatsOut = {
  first_seen: string | null;
  last_seen: string | null;
  suppliers_count: number;
  offers_in_stock: number;
  last_change_at: string | null;
};

export type ProductEventOut = {
  created_at: string;
  reason: "init" | "change" | "eol";
  price?: string | null;
  stock?: number | null;
  id_supplier?: number | null;
  supplier_name?: string | null;
  id_feed_run?: number | null;
};

export type SeriesDailyPoint = {
  date: string; // ISO date (00:00:00)
  price?: string | null; // preco médio/min (backend decide)
  stock?: number | null; // stock total/máx (backend decide)
};

export type ProductDetailResponse = {
  product: ProductOut;
  meta: ProductMetaOut[];
  offers: OfferOut[];
  best_offer: OfferOut | null;
  stats: ProductStatsOut;
  events: ProductEventOut[];
  series_daily: SeriesDailyPoint[];
};

export type ProductDetailParams = {
  expand_meta?: boolean;
  expand_offers?: boolean;
  expand_events?: boolean;
  events_days?: number | null;
  events_limit?: number | null;
  aggregate_daily?: boolean;
};
