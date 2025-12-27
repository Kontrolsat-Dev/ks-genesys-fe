// src/features/prices/active-offer/components/active-offer-table.tsx
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Spinner } from "@/components/genesys-ui";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtDate } from "@/helpers/fmtDate";
import { cn } from "@/lib/utils";

type ActiveOfferTableProps = {
  items: any[];
  isLoading: boolean;
  isFetching: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

type PriceChangeRowProps = {
  item: any;
};

function PriceChangeRow({ item }: PriceChangeRowProps) {
  const {
    product,
    old_price,
    new_price,
    abs_delta,
    pct_delta,
    direction,
    last_change_at,
  } = item;

  const isDown = direction === "down";
  const isUp = direction === "up";
  const directionLabel = isDown ? "Queda" : "Subida";

  return (
    <TableRow className="group hover:bg-muted/30">
      <TableCell>
        <div className="flex flex-col">
          <Link
            to={`/products/${product.id}`}
            className="font-medium hover:underline"
          >
            {product.name ?? "—"}
          </Link>
          <span className="text-xs text-muted-foreground">
            #{product.id_ecommerce ?? product.id}
          </span>
        </div>
      </TableCell>

      <TableCell className="hidden sm:table-cell">
        <div className="flex flex-col text-xs text-muted-foreground">
          <span>{product.gtin ?? "Sem GTIN"}</span>
          <span>{product.partnumber ?? ""}</span>
        </div>
      </TableCell>

      <TableCell className="text-right text-sm">
        {old_price != null ? `${old_price} €` : "—"}
      </TableCell>

      <TableCell className="text-right text-sm">
        {new_price != null ? `${new_price} €` : "—"}
      </TableCell>

      <TableCell
        className={cn(
          "text-right text-sm font-medium",
          isDown && "text-emerald-600 dark:text-emerald-400",
          isUp && "text-red-600 dark:text-red-400"
        )}
      >
        {abs_delta.toFixed(2)} €
      </TableCell>

      <TableCell
        className={cn(
          "text-right text-sm font-medium",
          isDown && "text-emerald-600 dark:text-emerald-400",
          isUp && "text-red-600 dark:text-red-400"
        )}
      >
        {pct_delta.toFixed(2)}%
      </TableCell>

      <TableCell className="text-center">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            isDown &&
              "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            isUp && "bg-red-500/10 text-red-700 dark:text-red-300"
          )}
        >
          {isDown ? (
            <ArrowDownRight className="h-3 w-3" />
          ) : (
            <ArrowUpRight className="h-3 w-3" />
          )}
          {directionLabel}
        </span>
      </TableCell>

      <TableCell className="hidden md:table-cell text-right text-xs text-muted-foreground">
        {last_change_at ? fmtDate(last_change_at) : "—"}
      </TableCell>
    </TableRow>
  );
}

function PriceChangesSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, idx) => (
        <TableRow key={idx}>
          <TableCell>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-16" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-16" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-16" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="mx-auto h-5 w-20" />
          </TableCell>
          <TableCell className="hidden md:table-cell text-right">
            <Skeleton className="ml-auto h-3 w-32" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function ActiveOfferTable({
  items,
  isLoading,
  isFetching,
  total,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}: ActiveOfferTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="min-w-full overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TableRow className="[&_th]:text-muted-foreground">
              <TableHead>Produto</TableHead>
              <TableHead className="hidden sm:table-cell">
                GTIN / Ref.
              </TableHead>
              <TableHead className="text-right">Preço antigo</TableHead>
              <TableHead className="text-right">Preço atual</TableHead>
              <TableHead className="text-right">Δ € (absoluto)</TableHead>
              <TableHead className="text-right">Δ %</TableHead>
              <TableHead className="text-center">Sentido</TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Última alteração
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <PriceChangesSkeleton />}

            {!isLoading && total === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>
                      Sem movimentos de preço para os filtros selecionados.
                    </span>
                    <span className="text-xs">
                      Ajusta a janela temporal ou reduz os mínimos de variação.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              items.map((item) => (
                <PriceChangeRow key={item.product.id} item={item} />
              ))}
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
                    {total.toLocaleString("pt-PT")}
                  </span>{" "}
                  {total === 1 ? "movimento" : "movimentos"}
                </>
              ) : (
                "Nenhum movimento"
              )}
            </span>
            {isFetching && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-1.5">
                  <Spinner size="xs" />a atualizar
                </span>
              </>
            )}
          </div>

          {/* Right: Pagination controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Página <span className="font-medium text-foreground">{page}</span>{" "}
              de{" "}
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
