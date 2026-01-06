export type PrestashopCategoriesResponse = {
  categories: {
    id_category: number;
    id_parent: number;
    name: string;
    level_depth: number;
    active: boolean;
    children?: any[];
  }[];
};

// ----------- PrestaShop JIT -----------

export type OrderDetailStatus = {
  id: number;
  name: string;
  color: string;
};

export type OrderDetailService = {
  cart_service_id: number;
  id_service_item: number;
  type: string;
  name: string;
  cost: number;
  sage_reference?: string | null;
  quantity: number;
  total_cost: number;
};

export type OrderDetailProduct = {
  product_id: number | string;
  product_reference?: string | null;
  product_name: string;
  product_quantity: number | string;
  product_price: number;
  product_ean13?: string | null;
  product_upc?: string | number | null;
  product_image?: string | null;
  services?: OrderDetailService[] | null;
};

export type PrestashopOrderDetail = {
  id: number;
  reference: string;
  date_add?: string | null;
  payment: string;
  discount: number;
  total: number;
  total_products?: number | null;
  total_wrapping?: number | null;
  payment_tax: number;
  status: OrderDetailStatus;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  delivery: {
    id: number;
    name: string;
    company?: string | null;
    vat_number?: string | null;
    address1?: string | null;
    address2?: string | null;
    postal_code?: string | null;
    city?: string | null;
    phone?: string | null;
    mobile?: string | null;
    country?: { id: number; iso_code: string; name: string } | null;
  };
  invoice: {
    id: number;
    name: string;
    company?: string | null;
    vat_number?: string | null;
    address1?: string | null;
    address2?: string | null;
    postal_code?: string | null;
    city?: string | null;
    country?: { id: number; iso_code: string; name: string } | null;
  };
  shipping: {
    carrier?: string | null;
    price?: number | null;
    weight?: number | null;
  } | null;
  products: OrderDetailProduct[];
  notes?: string | null;
  latest_message?: string | null;
};
