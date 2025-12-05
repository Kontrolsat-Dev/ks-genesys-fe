// src/features/products/search-state.ts
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useDebounced from "@/lib/debounce";

const parseIntSafe = (v: string | null, def = 1) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};

const parseBoolOrNull = (v: string | null): boolean | null => {
  if (v === null) return null;
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
};

const hasStockToUI = (b: boolean | null): "all" | "in" | "out" =>
  b === null ? "all" : b ? "in" : "out";

const importedToUI = (b: boolean | null): "all" | "imported" | "not_imported" =>
  b === null ? "all" : b ? "imported" : "not_imported";

export type ProductsSearchState = {
  page: number;
  pageSize: number;
  qParam: string | null;
  gtin: string | null;
  partnumber: string | null;
  id_brand: number | null;
  id_category: number | null;
  id_supplier: number | null;
  hasStock: boolean | null;
  imported: boolean | null;
  hasStockUI: "all" | "in" | "out";
  importedUI: "all" | "imported" | "not_imported";
  sort: "recent" | "name" | "cheapest";

  qInput: string;
  setQInput: (v: string) => void;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (val: "recent" | "name" | "cheapest") => void;
  setHasStockUI: (val: "all" | "in" | "out") => void;
  setImportedUI: (val: "all" | "imported" | "not_imported") => void;
  setBrandId: (val: string) => void;
  setCategoryId: (val: string) => void;
  setSupplierId: (val: string) => void;

  resetAllFilters: () => void;
};

export function useProductsSearchState(): ProductsSearchState {
  const [sp, setSp] = useSearchParams();

  // ler URL
  const page = parseIntSafe(sp.get("page"), 1);
  const pageSize = parseIntSafe(sp.get("page_size"), 20);
  const qParam = sp.get("q");
  const gtin = sp.get("gtin");
  const partnumber = sp.get("partnumber");
  const id_brand = sp.get("id_brand") ? Number(sp.get("id_brand")) : null;
  const id_category = sp.get("id_category")
    ? Number(sp.get("id_category"))
    : null;
  const id_supplier = sp.get("id_supplier")
    ? Number(sp.get("id_supplier"))
    : null;

  const hasStock = parseBoolOrNull(sp.get("has_stock")); // true | false | null
  const imported = parseBoolOrNull(sp.get("imported")); // true | false | null

  const hasStockUI = hasStockToUI(hasStock);
  const importedUI = importedToUI(imported);

  const sort = (sp.get("sort") as "recent" | "name" | "cheapest") ?? "recent";

  // input de pesquisa (controlado) sincronizado com URL ?q=
  const [qInput, setQInput] = useState(qParam ?? "");
  useEffect(() => {
    // quando a URL mudar (vindo do Topbar, back/forward, etc.), atualiza o input
    setQInput(qParam ?? "");
  }, [qParam]);

  const qDebounced = useDebounced(qInput.trim(), 350);

  // atualiza URL com debounce, e volta a page=1
  useEffect(() => {
    const usp = new URLSearchParams(sp);
    if (qDebounced) usp.set("q", qDebounced);
    else usp.delete("q");
    usp.delete("gtin");
    usp.delete("partnumber");
    usp.set("page", "1");
    setSp(usp, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced]);

  const updateSp = (mutate: (u: URLSearchParams) => void) => {
    const usp = new URLSearchParams(sp);
    mutate(usp);
    setSp(usp);
  };

  const resetAllFilters = () => {
    const usp = new URLSearchParams();
    usp.set("page", "1");
    usp.set("page_size", String(pageSize)); // mantém o pageSize atual
    // não colocamos q, id_brand, id_category, id_supplier, has_stock, imported, etc.
    setSp(usp, { replace: true });
    setQInput(""); // limpa o input imediatamente
  };

  return {
    page,
    pageSize,
    qParam,
    gtin,
    partnumber,
    id_brand,
    id_category,
    id_supplier,
    hasStock,
    imported,
    hasStockUI,
    importedUI,
    sort,

    qInput,
    setQInput,

    setPage: (newPage: number) =>
      updateSp((u) => {
        u.set("page", String(Math.max(1, newPage)));
      }),

    setPageSize: (val: number) =>
      updateSp((u) => {
        u.set("page_size", String(val));
        u.set("page", "1");
      }),

    setSort: (val: "recent" | "name" | "cheapest") =>
      updateSp((u) => {
        u.set("sort", val);
        u.set("page", "1");
      }),

    setHasStockUI: (val: "all" | "in" | "out") =>
      updateSp((u) => {
        if (val === "all") u.delete("has_stock");
        if (val === "in") u.set("has_stock", "true");
        if (val === "out") u.set("has_stock", "false");
        u.set("page", "1");
      }),

    setImportedUI: (val: "all" | "imported" | "not_imported") =>
      updateSp((u) => {
        if (val === "all") u.delete("imported");
        else if (val === "imported") u.set("imported", "true");
        else u.set("imported", "false");
        u.set("page", "1");
      }),

    setBrandId: (v: string) =>
      updateSp((u) => {
        if (v === "all") u.delete("id_brand");
        else u.set("id_brand", v);
        u.set("page", "1");
      }),

    setCategoryId: (v: string) =>
      updateSp((u) => {
        if (v === "all") u.delete("id_category");
        else u.set("id_category", v);
        u.set("page", "1");
      }),

    setSupplierId: (v: string) =>
      updateSp((u) => {
        if (v === "all") u.delete("id_supplier");
        else u.set("id_supplier", v);
        u.set("page", "1");
      }),

    resetAllFilters,
  };
}
