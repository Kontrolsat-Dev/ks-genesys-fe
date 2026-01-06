// src/api/orders-dropshipping/index.ts
import { OrdersDropshippingService } from "./service";

export const ordersDropshippingClient = new OrdersDropshippingService();

export * from "./types";
