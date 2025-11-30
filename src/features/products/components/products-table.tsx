// src/features/products/components/products-table.tsx
import { Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import Highlight from "@/components/genesys-ui/hightlight";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

import { fmtPrice } from "@/helpers/fmtPrices";
import type { ProductExt } from "@/api/products";

import {
  OffersInline,
  StatusDot,
  TableEmpty,
  TableSkeleton,
} from "@/features/products/components";

type ProductsTableProps = {
  items: ProductExt[];
  qParam: string | null;
  isLoading: boolean;
};

export default function ProductsTable({
  items,
  qParam,
  isLoading,
}: ProductsTableProps) {
  return (
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
                            <AvatarImage src={p.image_url} alt={p.name || ""} />
                          ) : (
                            <AvatarFallback className="text-[10px]">
                              {initials}
                            </AvatarFallback>
                          )}
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="max-w-[32ch] truncate font-medium leading-tight">
                              <Highlight
                                text={p.name || "—"}
                                query={qParam || ""}
                              />
                            </div>
                            <Badge
                              variant={p.id_ecommerce ? "secondary" : "outline"}
                              className={cn(
                                "h-5 px-2 text-[10px] font-medium",
                                p.id_ecommerce ? "border-emerald-300" : ""
                              )}
                            >
                              {p.id_ecommerce ? "importado" : "por importar"}
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
                        <Highlight text={p.brand_name} query={qParam || ""} />
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
    </Card>
  );
}
