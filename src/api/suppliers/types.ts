export type SupplierCreate = {
  name: string;
  active?: boolean;
  logo_image?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  margin?: number;
  country?: string | null;
};

export type Supplier = {
  id: number;
  name: string;
  active: boolean;
  logo_image?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  margin: number;
  country?: string | null;
  created_at: string;
  updated_at: string | null;
};

export type SupplierListResponse = {
  items: Supplier[];
  total: number;
  page: number;
  page_size: number;
};

export type SupplierFeedCreate = {
  kind: string;
  format: string;
  url: string;
  active?: boolean;
  headers?: Record<string, string> | null;
  params?: Record<string, string> | null;
  auth_kind?: string | null;
  auth?: Record<string, any> | null;
  extra?: FeedExtra | null; // << aqui
  csv_delimiter?: string | null;
};

export type FeedExtra = HttpFeedExtra & FtpFeedExtra;

export type FeedTestRequest = {
  kind?: string | null;
  format: string;
  url: string;
  headers?: Record<string, string> | null;
  params?: Record<string, string> | null;
  auth_kind?: string | null;
  auth?: Record<string, any> | null;
  extra?: FeedExtra | null; // << aqui
  csv_delimiter?: string | null;
  max_rows?: number | null;
};

export type SupplierFeedOut = {
  id: number;
  id_supplier: number;
  kind: string;
  format: string;
  url: string;
  active: boolean;
  headers_json?: string | null;
  params_json?: string | null;
  auth_kind?: string | null;
  auth_json?: string | null;
  extra_json?: string | null;
  csv_delimiter?: string | null;
  has_auth: boolean;
  created_at: string;
  updated_at: string | null;
};

export type HttpFeedExtra = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body_json?: Record<string, any> | null;
  pagination?: {
    mode: "page"; // atualmente só suportas page/size
    page_field: string;
    size_field: string;
    start: number;
    max_pages: number;
    stop_on_empty: boolean;
  };
};

// Extra para feeds FTP
export type FtpFeedExtra = {
  // Globomatik-style: trigger HTTP antes de ler do FTP
  trigger_http_url?: string;
  trigger_http_method?: "GET" | "POST";
  // ZIP por FTP
  compression?: "none" | "zip";
  zip_entry_name?: string;
};

export type FeedTestResponse = {
  ok: boolean;
  status_code: number;
  content_type: string | null;
  bytes_read: number;
  preview_type: string | null;
  rows_preview: Array<Record<string, any>> | null;
  error?: string | null;
};

export type FeedMapperOut = {
  id: number;
  id_feed: number;
  profile: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string | null;
};

export type MapperValidateIn = {
  profile?: Record<string, any> | null;
  headers?: string[] | null;
};

export type MapperValidateOut = {
  ok: boolean;
  errors: Array<Record<string, any>>;
  warnings: Array<Record<string, any>>;
  required_coverage: Record<string, any>;
  headers_checked: boolean;
};

export type SupplierDetailOut = {
  supplier: Supplier;
  feed: SupplierFeedOut | null;
  mapper: FeedMapperOut | null;
};

export type MapperUpsertIn = {
  profile: Record<string, any>;
  bump_version?: boolean;
};

export type SupplierUpdateRequest = {
  supplier?: SupplierCreate;
  feed?: SupplierFeedCreate;
  mapper?: MapperUpsertIn;
};
