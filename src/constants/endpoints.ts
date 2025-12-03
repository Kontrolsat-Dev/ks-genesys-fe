// src/constants/endpoints.ts
export const Endpoints = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,

  //----------- Auth
  AUTH_LOGIN: "auth/login",
  AUTH_ME: "auth/me",

  //-----------  Suppliers
  SUPPLIERS: "suppliers",
  SUPPLIER_BY_ID: (id: number) => `suppliers/${id}`,

  //----------- Feeds
  FEED_BY_SUPPLIER: (id: number) => `feeds/supplier/${id}`,
  FEEDS_TEST: "feeds/test",

  // Mappers
  MAPPER_BY_FEED: (id: number) => `mappers/feed/${id}`,
  MAPPER_BY_SUPPLIER: (id: number) => `mappers/supplier/${id}`,
  MAPPER_VALIDATE: (id: number) => `mappers/feed/${id}/validate`,
  MAPPER_OPS: "mappers/ops",

  // Runs
  RUNS_INGEST_SUPPLIER: (id: number) => `runs/supplier/${id}/ingest`,

  //----------- Products
  PRODUCTS: "products",
  PRODUCT: (id: number) => `products/${id}`,
  PRODUCT_UPDATE_MARGIN: (id: number) => `products/${id}/margin`,
  PRODUCT_ACTIVE_OFFER_PRICE_CHANGES: "products/active-offer/price-changes",
  PRODUCT_CATALOG_PRICE_CHANGES: "products/price-changes/catalog",

  // Categories
  CATEGORIES: "categories",

  // Brands
  BRANDS: "brands",

  // ----------- System
  HEALTHZ: "healthz",

  // ----------- Catalog-update-stream
  CATALOG_UPDATE_STREAM: "catalog/update-stream",
  CATALOG_UPDATE_STREAM_ERRORS: "catalog/update-stream/errors",

  // ----------- Workers
  WORKER_JOBS: "worker/jobs",
  WORKER_JOBS_ERROR: "worker/jobs/error",
} as const;
