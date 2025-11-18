// src/features/products/index.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import Highlight from "@/components/genesys-ui/hightlight";
import { cn } from "@/lib/utils";
import { Loader2, Search, ExternalLink } from "lucide-react";
import { useProductsList } from "./queries";
import { fmtPrice } from "@/helpers/fmtPrices";
import type { ProductExt } from "@/api/products";
import {
  OffersInline,
  StatusDot,
  TableEmpty,
  TableSkeleton,
} from "@/features/products/components";

/* ---------------- helpers ---------------- */
function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

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

/* ---------------- page ---------------- */
export default function ProductsPage() {
  const [sp, setSp] = useSearchParams();

  // URL → filtros (source of truth)
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
  const hasStockUI = hasStockToUI(hasStock);
  const sort = (sp.get("sort") as "recent" | "name" | "cheapest") ?? "recent";

  // input de pesquisa (controlado) sincronizado com URL ?q=
  const [qInput, setQInput] = useState(qParam ?? "");
  useEffect(() => {
    // quando a URL mudar (vindo do Topbar, back/forward, etc.), atualiza o input
    setQInput(qParam ?? "");
  }, [qParam]);

  const qDebounced = useDebounced(qInput.trim(), 350);
  // aplica debounce na URL (e volta a page=1)
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

  // chamada à API com os filtros da URL
  const { data, isLoading, isFetching } = useProductsList({
    page,
    pageSize,
    q: qParam,
    gtin,
    partnumber,
    id_brand,
    id_category,
    id_supplier,
    has_stock: hasStock,
    sort,
  });

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1),
    [data]
  );
  const elapsedMs = (data as any)?.elapsedMs as number | undefined;
  const items: ProductExt[] = data?.items ?? [];

  // handlers de UI → URL
  const updateSp = (mutate: (u: URLSearchParams) => void) => {
    const usp = new URLSearchParams(sp);
    mutate(usp);
    setSp(usp);
  };

  const onChangeHasStock = (val: "all" | "in" | "out") => {
    updateSp((u) => {
      if (val === "all") u.delete("has_stock");
      if (val === "in") u.set("has_stock", "true");
      if (val === "out") u.set("has_stock", "false");
      u.set("page", "1");
    });
  };

  const onChangeSort = (val: "recent" | "name" | "cheapest") => {
    updateSp((u) => {
      u.set("sort", val);
      u.set("page", "1");
    });
  };

  const onChangePageSize = (val: number) => {
    updateSp((u) => {
      u.set("page_size", String(val));
      u.set("page", "1");
    });
  };

  const goPrev = () =>
    updateSp((u) => u.set("page", String(Math.max(1, page - 1))));
  const goNext = () =>
    updateSp((u) => u.set("page", String(Math.min(totalPages, page + 1))));

  return (
    <TooltipProvider delayDuration={100}>
      <div className="mx-auto space-y-6">
        {/* Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">Produtos</h1>
              <p className="text-sm text-muted-foreground">
                Catálogo agregado com ofertas por fornecedor e melhor preço.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-[360px]">
                <span className="absolute left-2 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-slate-400 pointer-events-none" />
                </span>
                <Input
                  placeholder="Pesquisar por nome, GTIN, MPN…"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Stock */}
              <Select
                value={hasStockUI}
                onValueChange={(v) => onChangeHasStock(v as any)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in">Com stock</SelectItem>
                  <SelectItem value="out">Sem stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={sort}
                onValueChange={(v) => onChangeSort(v as any)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recentes</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="cheapest">Preço</SelectItem>
                </SelectContent>
              </Select>

              {/* Page size */}
              <Select
                value={String(pageSize)}
                onValueChange={(v) => onChangePageSize(Number(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}/página
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-0 text-xs text-muted-foreground">
            {data
              ? `${data.total} resultados` +
                (typeof elapsedMs === "number"
                  ? ` • ${Math.round(elapsedMs)} ms`
                  : "") +
                (isFetching ? " • a atualizar…" : "")
              : "—"}
          </div>
        </Card>

        {/* Tabela */}
        <Card className="overflow-hidden p-0">
          <div className="min-w-full overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TableRow className="[&_th]:text-muted-foreground">
                  <TableHead className="w-[36%]">Produto</TableHead>
                  <TableHead className="w-[12%]">Marca</TableHead>
                  <TableHead className="w-[16%]">GTIN/MPN</TableHead>
                  <TableHead className="w-[16%]">Ofertas</TableHead>
                  <TableHead className="w-[10%] text-right">Preço</TableHead>
                  <TableHead className="w-[8%] text-right">Stock</TableHead>
                  <TableHead className="w-[2%]"> </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && (
                  <TableSkeleton rows={10} cols={7} rightAlignCols={[4, 5]} />
                )}

                {!isLoading && items.length === 0 && <TableEmpty />}

                {!isLoading &&
                  items.map((p) => {
                    const initials = (p.brand_name || p.name || "?")
                      .slice(0, 2)
                      .toUpperCase();
                    const bestPrice =
                      p.best_offer?.price != null
                        ? Number.parseFloat(p.best_offer.price)
                        : NaN;

                    return (
                      <TableRow key={p.id} className="group hover:bg-muted/30">
                        {/* Produto */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border rounded-md">
                              {p.image_url ? (
                                <AvatarImage
                                  src={p.image_url}
                                  alt={p.name || ""}
                                />
                              ) : (
                                <AvatarFallback className="text-[10px]">
                                  {initials}
                                </AvatarFallback>
                              )}
                            </Avatar>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="truncate font-medium leading-tight max-w-[32ch]">
                                  <Highlight
                                    text={p.name || "—"}
                                    query={qParam || ""}
                                  />
                                </div>
                                <Badge
                                  variant={
                                    p.id_ecommerce ? "secondary" : "outline"
                                  }
                                  className={cn(
                                    "h-5 px-2 text-[10px] font-medium",
                                    p.id_ecommerce ? "border-emerald-300" : ""
                                  )}
                                >
                                  {p.id_ecommerce
                                    ? "importado"
                                    : "por importar"}
                                </Badge>
                              </div>

                              <div className="truncate text-xs text-muted-foreground">
                                {p.category_name || "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Marca */}
                        <TableCell className="truncate">
                          {p.brand_name ? (
                            <Highlight
                              text={p.brand_name}
                              query={qParam || ""}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        {/* GTIN/MPN */}
                        <TableCell className="truncate">
                          <div className="text-xs">
                            <span className="text-muted-foreground">GTIN:</span>{" "}
                            {p.gtin ? (
                              <Highlight text={p.gtin} query={qParam || ""} />
                            ) : (
                              "—"
                            )}
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">MPN:</span>{" "}
                            {p.partnumber ? (
                              <Highlight
                                text={String(p.partnumber)}
                                query={qParam || ""}
                              />
                            ) : (
                              "—"
                            )}
                          </div>
                        </TableCell>

                        {/* Ofertas */}
                        <TableCell>
                          <OffersInline offers={p.offers} best={p.best_offer} />
                        </TableCell>

                        {/* Preço (melhor oferta) */}
                        <TableCell className="text-right">
                          <div className="leading-tight">
                            <div className="text-[11px] text-muted-foreground">
                              desde
                            </div>
                            <div className="text-base font-semibold tabular-nums">
                              {Number.isFinite(bestPrice)
                                ? fmtPrice(bestPrice)
                                : "—"}
                            </div>
                          </div>
                        </TableCell>

                        {/* Stock (melhor oferta) */}
                        <TableCell className="text-right">
                          {typeof p.best_offer?.stock === "number" ? (
                            <div className="inline-flex items-center justify-end gap-2">
                              <StatusDot ok={(p.best_offer?.stock ?? 0) > 0} />
                              <span className="text-sm tabular-nums">
                                {p.best_offer?.stock}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        {/* Ações */}
                        <TableCell>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                          >
                            <Link to={`/products/${p.id}`} title="Ver detalhe">
                              <ExternalLink className="h-4 w-4" />
                              Detalhe
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Separator />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-xs text-muted-foreground">
              Página {data?.page ?? page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={(data?.page ?? page) <= 1 || isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                disabled={(data?.page ?? page) >= totalPages || isFetching}
              >
                Seguinte
              </Button>
              {isFetching && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
