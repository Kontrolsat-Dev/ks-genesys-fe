// src/features/prices/catalog/components/catalog-table.tsx
import { Link } from "react-router-dom";
import type { ProductPriceChangeItem } from "@/api/products";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { fmtMoney, fmtPrice } from "@/helpers/fmtPrices";
import { fmtDate } from "@/helpers/fmtDate";

type CatalogTableProps = {
  items: ProductPriceChangeItem[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  totalPages: number;
  total: number;
  elapsedMs?: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

function directionBadgeVariant(dir: "up" | "down") {
  return dir === "up" ? "default" : "destructive";
}

export default function CatalogTable({
  items,
  isLoading,
  isFetching,
  page,
  totalPages,
  total,
  elapsedMs,
  onPrevPage,
  onNextPage,
}: CatalogTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="min-w-full overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TableRow className="[&_th]:text-muted-foreground">
              <TableHead className="w-[80px]">Produto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Preço antigo</TableHead>
              <TableHead className="text-right">Preço novo</TableHead>
              <TableHead className="text-right">Δ €</TableHead>
              <TableHead className="text-right">Δ %</TableHead>
              <TableHead className="text-center">Direção</TableHead>
              <TableHead className="text-right">Última alteração</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[220px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-14 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-14 ml-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Nenhum movimento de preço encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              items.map((row) => {
                const absDelta = row.delta_abs ? Number(row.delta_abs) : null;
                const pctDelta = row.delta_pct ? Number(row.delta_pct) : null;

                return (
                  <TableRow
                    key={row.id_product}
                    className="group hover:bg-muted/30"
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      #{row.id_product}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Link
                          to={`/products/${row.id_product}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {row.name ?? "(Sem nome)"}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {row.brand_name && `${row.brand_name} · `}
                          {row.category_name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {row.previous_price ? fmtMoney(row.previous_price) : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      {row.current_price ? fmtMoney(row.current_price) : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      {absDelta != null ? fmtPrice(absDelta) : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      {pctDelta != null ? `${pctDelta.toFixed(1)}%` : "—"}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant={directionBadgeVariant(row.direction)}
                        className="text-[11px]"
                      >
                        {row.direction === "down" ? "Queda" : "Subida"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground">
                      {fmtDate(row.updated_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Paginação - Vercel-like design */}
      <div className="border-t bg-muted/30">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Results info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {total > 0 ? (
                <>
                  <span className="font-medium text-foreground">
                    {total.toLocaleString()}
                  </span>{" "}
                  {total === 1 ? "resultado" : "resultados"}
                </>
              ) : (
                "Nenhum resultado"
              )}
            </span>
            {typeof elapsedMs === "number" && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span>{Math.round(elapsedMs)} ms</span>
              </>
            )}
            {isFetching && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  a atualizar
                </span>
              </>
            )}
          </div>

          {/* Right: Pagination controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Página{" "}
              <span className="font-medium text-foreground">{page}</span> de{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevPage}
                disabled={page <= 1 || isFetching}
                className="h-8 px-2.5 gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={page >= totalPages || isFetching}
                className="h-8 px-2.5 gap-1"
              >
                <span className="hidden sm:inline">Seguinte</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
