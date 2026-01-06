// src/api/orders-dropshipping/types.ts

// ----------- Enums -----------

export type OrderStatus =
  | "pending"
  | "ordered"
  | "shipped_store"
  | "completed"
  | "cancelled"
  | "error";

// ----------- Morada -----------

export type AddressOut = {
  id_address?: number | null;
  firstname?: string | null;
  lastname?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  postcode?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  phone_mobile?: string | null;
  vat_number?: string | null;
  dni?: string | null;
};

// ----------- Linha de Encomenda -----------

export type DropshippingOrderLineOut = {
  id: number;
  id_ps_order_detail: number;
  id_ps_product: number;

  product_name: string;
  product_reference?: string | null;
  product_ean?: string | null;
  product_supplier_reference?: string | null;

  qty: number;
  unit_price_tax_excl: string;
  unit_price_tax_incl: string;
  total_price_tax_excl: string;
  total_price_tax_incl: string;

  status: OrderStatus;

  // Match com Genesys
  id_product?: number | null;
  product_matched: boolean;

  // Fornecedor selecionado
  id_supplier?: number | null;
  supplier_name?: string | null;
  supplier_cost?: string | null;

  // Pedido ao fornecedor
  id_supplier_order?: number | null;
};

// ----------- Encomenda -----------

export type DropshippingOrderOut = {
  id: number;
  id_ps_order: number;
  reference: string;
  ps_state_id: number;
  ps_state_name?: string | null;

  customer_email: string;
  customer_firstname: string;
  customer_lastname: string;
  customer_name: string;

  delivery_address?: AddressOut | null;
  invoice_address?: AddressOut | null;

  carrier_name?: string | null;
  payment_method?: string | null;

  total_paid_tax_incl: string;
  total_paid_tax_excl: string;
  total_shipping_tax_incl: string;
  total_shipping_tax_excl: string;

  ps_date_add: string;
  ps_date_upd: string;
  created_at: string;

  lines: DropshippingOrderLineOut[];
  lines_count: number;
  lines_pending: number;
  lines_matched: number;
};

export type DropshippingOrderListOut = {
  items: DropshippingOrderOut[];
  total: number;
  page: number;
  page_size: number;
};

// ----------- Pedido ao Fornecedor -----------

export type SupplierOrderLineOut = {
  id: number;
  id_order: number;
  order_reference: string;
  product_name: string;
  product_ean?: string | null;
  qty: number;
  supplier_cost?: string | null;
};

export type SupplierOrderOut = {
  id: number;
  id_supplier: number;
  supplier_name?: string | null;

  status: OrderStatus;
  total_cost: string;
  total_items: number;

  sage_order_id?: string | null;
  clickup_task_id?: string | null;

  created_at: string;
  ordered_at?: string | null;
  completed_at?: string | null;

  lines: SupplierOrderLineOut[];
};

export type SupplierOrderListOut = {
  items: SupplierOrderOut[];
  total: number;
  page: number;
  page_size: number;
};

// ----------- Params -----------

export type ListOrdersParams = {
  page?: number;
  pageSize?: number;
  status?: OrderStatus | null;
};

export type ListSupplierOrdersParams = {
  page?: number;
  pageSize?: number;
  id_supplier?: number | null;
  status?: OrderStatus | null;
};

// ----------- Actions -----------

export type SelectSupplierIn = {
  id_supplier: number;
  supplier_cost?: string | null;
};

export type ImportResult = {
  success: boolean;
  total_fetched: number;
  imported: number;
  skipped: number;
  errors: number;
};

// ----------- Pending Lines com Ofertas -----------

export type SupplierOfferOut = {
  id_supplier: number;
  supplier_name?: string | null;
  supplier_image?: string | null;
  price: string;
  stock: number;
};

export type PendingLineWithOffers = {
  id: number;
  id_order: number;
  id_ps_order: number;
  order_reference: string;
  ps_state_name?: string | null;
  customer_name: string;

  id_ps_order_detail: number;
  id_ps_product: number;

  product_name: string;
  product_reference?: string | null;
  product_ean?: string | null;
  product_supplier_reference?: string | null;

  qty: number;
  unit_price_tax_excl: string;
  unit_price_tax_incl: string;

  id_product?: number | null;
  status: OrderStatus;

  offers: SupplierOfferOut[];
};

export type PendingLinesListOut = {
  items: PendingLineWithOffers[];
  total: number;
};


