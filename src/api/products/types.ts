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

// --- DETALHE ---

export type ProductMetaOut = {
  name: string;
  value: string;
  // Backend atualmente NÃO envia created_at.
  // Mantemos como opcional para não arrebentar o componente,
  // e depois podemos decidir se mostramos outra coisa ou removemos da UI.
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
