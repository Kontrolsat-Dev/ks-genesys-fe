// src/app/app-router.tsx
// Configuração das rotas da aplicação

import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./guards/require-auth";
import { PublicLayout } from "./layouts/public-layout";
import PrivateLayout from "./layouts/private-layout";

import LoginPage from "@/features/auth/login";
import HomePage from "@/features/home";
// Suppliers
import SuppliersPage from "@/features/suppliers";
import SuppliersCreatePage from "@/features/suppliers/create";
import SupplierEditPage from "@/features/suppliers/edit";
// Products
import ProductsPage from "@/features/products";
import ProductPage from "@/features/products/product";
import CategoriesPage from "@/features/products/categories";
import BrandsPage from "@/features/products/brands";
// System
import ManualRunsPage from "@/features/system/manual-runs";
import UpdateStreamPage from "@/features/system/update-stream";
import UpdateStreamErrorPage from "@/features/system/update-stream-errors";
import WorkerJobsPage from "@/features/system/worker-jobs";
import PricesActiveOfferPage from "@/features/prices/active-offer";
import PricesCompleteCatalogPage from "@/features/prices/catalog";

export const router = createBrowserRouter([
  // público
  {
    path: "/login",
    element: (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    ),
  },

  // privado
  {
    path: "/",
    element: (
      <RequireAuth>
        <PrivateLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      // Suppliers
      { path: "/suppliers", element: <SuppliersPage /> },
      { path: "/suppliers/create", element: <SuppliersCreatePage /> },
      { path: "/suppliers/:id/edit", element: <SupplierEditPage /> },
      // Products
      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:id", element: <ProductPage /> },
      { path: "/categories", element: <CategoriesPage /> },
      { path: "/brands", element: <BrandsPage /> },
      // Prices
      { path: "/prices/active-offer", element: <PricesActiveOfferPage /> },
      { path: "/prices/catalog", element: <PricesCompleteCatalogPage /> },
      // System
      { path: "/system/manual-runs", element: <ManualRunsPage /> },
      { path: "/system/update-stream", element: <UpdateStreamPage /> },
      { path: "/system/dlq", element: <UpdateStreamErrorPage /> },
      { path: "/system/workers", element: <WorkerJobsPage /> },
    ],
  },

  // fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);
