export type HealthResponse = {
  ok: boolean;
  status: string;
  service?: string; // default "backend"
  env: string;
  now: string;
  uptime_s?: number | null;
  db_ok?: boolean | null;
};

// Update List ---------------

export type CatalogUpdateStatus = "pending" | "processing" | "done" | "failed";

export type CatalogUpdateStreamListParams = {
  status?: CatalogUpdateStatus;
  page?: number;
  page_size?: number;
};
export type CatalogUpdateStreamPayloadProduct = {
  gtin?: string | null;
  partnumber?: string | null;
  name?: string | null;
  margin?: number | null;
  is_enabled?: boolean;
  is_eol?: boolean;
};

export type CatalogUpdateStreamPayloadActiveOffer = {
  id_supplier?: number | null;
  id_supplier_item?: number | null;
  unit_cost?: number | null;
  unit_price_sent?: number | null;
  stock_sent?: number | null;
};

export type CatalogUpdateStreamPayloadShipping = {
  id_supplier?: number | null;
};

export type CatalogUpdateStreamPayload = {
  reason?: string;
  product?: CatalogUpdateStreamPayloadProduct;
  active_offer?: CatalogUpdateStreamPayloadActiveOffer;
  shipping?: CatalogUpdateStreamPayloadShipping;
  // futuro-safe para campos novos
  [key: string]: unknown;
};

export type CatalogUpdateStreamItem = {
  id: number;
  id_product: number;
  id_ecommerce?: number | null;

  status: CatalogUpdateStatus;
  event_type: string;
  priority: number;
  attempts: number;
  last_error?: string | null;

  created_at: string;
  processed_at?: string | null;

  payload?: CatalogUpdateStreamPayload | null;
};

export type CatalogUpdateStreamListResponse = {
  items: CatalogUpdateStreamItem[];
  total: number;
  page: number;
  page_size: number;
};
