// src/api/products/types.ts

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
  imported?: boolean | null;
};

export type OfferOut = {
  id_supplier: number;
  supplier_name?: string | null;
  supplier_image?: string | null;

  id_feed: number;
  sku: string;

  price?: string | null;
  stock?: number | null;
  id_last_seen_run?: number | null;
  updated_at?: string | null;
};

/**
 * Produto base — corresponde ao ProductOut do backend:
 * NUNCA tem offers nem best_offer.
 */
export type ProductOut = {
  id: number;
  gtin?: string | null;
  id_ecommerce?: number | null;
  id_brand?: number | null;
  brand_name?: string | null;
  id_category?: number | null;
  category_name?: string | null;
  partnumber?: string | null;
  name?: string | null;
  margin: number | null;
  // Taxas adicionais
  ecotax: number;
  extra_fees: number;
  description?: string | null;
  image_url?: string | null;
  weight_str?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/**
 * Item de lista — equivalente ao ProductListItemOut no backend:
 * produto base + ofertas + best_offer.
 */
export type ProductListItemOut = ProductOut & {
  offers: OfferOut[];
  best_offer: OfferOut | null;
  active_offer: OfferOut | null;
};

export type ProductListResponse = {
  items: ProductListItemOut[];
  total: number;
  page: number;
  page_size: number;
};

/**
 * Compat / alias para código legado.
 * Se noutros sítios usares ProductExt para listagens,
 * isto garante que continua a funcionar.
 */
export type ProductExt = ProductListItemOut;

// --- FACETS ---
// Mesmos filtros do list, mas sem paginação/sort

export type ProductFacetsParams = {
  q?: string | null;
  gtin?: string | null;
  partnumber?: string | null;
  id_brand?: number | null;
  brand?: string | null;
  id_category?: number | null;
  category?: string | null;
  has_stock?: boolean | null;
  id_supplier?: number | null;
  imported?: boolean | null;
};

export type ProductFacetsOut = {
  brand_ids: number[];
  category_ids: number[];
  supplier_ids: number[];
};

// --- DETALHE ---

export type ProductMetaOut = {
  name: string;
  value: string;
  created_at?: string | null;
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
  /**
   * Produto base — sem offers/best_offer,
   * tal como no ProductDetailOut do backend.
   */
  product: ProductOut;

  meta: ProductMetaOut[];

  // Ofertas atuais (todas) e best_offer calculada via ProductActiveOffer
  offers: OfferOut[];
  best_offer: OfferOut | null;
  active_offer: OfferOut | null;

  stats: ProductStatsOut;

  // Backend pode devolver null ou omitir → tornamos opcionais
  events?: ProductEventOut[] | null;
  series_daily?: SeriesDailyPoint[] | null;
};

export type ProductDetailParams = {
  expand_meta?: boolean;
  expand_offers?: boolean;
  expand_events?: boolean;
  events_days?: number | null;
  events_limit?: number | null;
  aggregate_daily?: boolean;
};

export type ProductMarginUpdate = {
  margin: number;
  ecotax?: number | null;
  extra_fees?: number | null;
};

// --- MOVIMENTOS DE PREÇO ---

export type PriceChangeDirection = "up" | "down" | "both";

export type ProductPriceChangeListParams = {
  direction?: PriceChangeDirection; // default: "down"
  days?: number;
  min_abs_delta?: number | null;
  min_pct_delta?: number | null;
  page?: number;
  page_size?: number;
};

export type ProductPriceChangeItem = {
  id_product: number;
  name: string | null;
  brand_name: string | null;
  category_name: string | null;

  previous_price: string | null; // vem como string do backend
  current_price: string | null; // idem

  delta_abs: string | null; // "-37.99"
  delta_pct: string | null; // "-62.33"

  direction: Exclude<PriceChangeDirection, "both">; // "up" | "down"
  updated_at: string;
};

export type ProductPriceChangeListOut = {
  items: ProductPriceChangeItem[];
  total: number;
  page: number;
  page_size: number;
};

// --- IMPORT PRODUCT ---
export type ProductImportIn = {
  id_ps_category: number;
};

export type ProductImportOut = {
  id_product: number;
  id_ecommerce: number | null;
  success: boolean;
  price_sent?: string | null;
  stock_sent?: number | null;
};

// --- BULK IMPORT ---
export type BulkImportIn = {
  product_ids: number[];
  id_ps_category?: number | null;
  category_margins?: Record<number, number> | null;
};

export type BulkImportItemResult = {
  id_product: number;
  success: boolean;
  id_ecommerce?: number | null;
  error?: string | null;
};

export type BulkImportOut = {
  total: number;
  imported: number;
  failed: number;
  skipped: number;
  results: BulkImportItemResult[];
};

