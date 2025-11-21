"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OfferOut, ProductOut } from "@/api/products/types";
import { useUpdateProductMargin } from "../queries";
import { fmtPrice } from "@/helpers/fmtPrices";
import { fmtMargin } from "@/helpers/fmtNumbers";

type MarginUpdateProps = {
  product: ProductOut;
  offers: OfferOut[];
  children: ReactNode;
};

export default function MarginUpdate({
  product,
  offers,
  children,
}: MarginUpdateProps) {
  const initialMargin = typeof product.margin === "number" ? product.margin : 0;

  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(Math.max(0, initialMargin * 100));

  const mutation = useUpdateProductMargin(product.id);
  const marginDecimal = useMemo(() => percent / 100, [percent]);
  const hasChanged = Math.abs(percent - initialMargin * 100) > 0.1;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      const current = typeof product.margin === "number" ? product.margin : 0;
      setPercent(Math.max(0, current * 100));
    }
  };

  const handleSave = () => {
    mutation.mutate(
      { margin: marginDecimal },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const isSaving = mutation.isPending;
  const hasOffers = offers && offers.length > 0;

  if (!product) {
    console.error("[v0] MarginUpdate: product prop is undefined or null");
    return null;
  }

  return (
    <>
      <div
        onClick={() => handleOpenChange(true)}
        className="h-full w-full"
        role="button"
      >
        {children}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl">
              Ajustar Margem do Produto
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Defina a margem a aplicar sobre o preço de custo das ofertas
              ativas. A fórmula usada é:{" "}
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                custo × (1 + margem)
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Margem Atual
                </p>
                <p className="text-2xl font-semibold font-mono">
                  {fmtMargin(initialMargin) ?? "0%"}
                </p>
              </div>

              <div
                className={`rounded-lg border-2 p-4 transition-colors ${
                  hasChanged
                    ? "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                    : "border-border bg-muted/50"
                }`}
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Nova Margem
                </p>
                <p className="text-2xl font-semibold font-mono">
                  {(marginDecimal * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Margem (%)</label>
                  <span className="text-lg font-mono font-semibold text-green-600 dark:text-green-400">
                    {Math.round(percent)}%
                  </span>
                </div>

                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[percent]}
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : 0;
                    setPercent(val);
                  }}
                  className="w-full"
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Impacto nas Ofertas</h3>
              <div className="rounded-lg border border-border overflow-hidden">
                {hasOffers ? (
                  <div className="max-h-72 overflow-auto">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow className="hover:bg-muted/50">
                          <TableHead className="font-semibold">
                            Fornecedor
                          </TableHead>
                          <TableHead className="font-semibold text-right">
                            Preço Base
                          </TableHead>
                          <TableHead className="font-semibold text-right">
                            Preço Final
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offers.map((offer, idx) => {
                          const basePrice =
                            offer.price != null
                              ? Number(offer.price)
                              : Number.NaN;
                          const priceWithMargin =
                            Number.isFinite(basePrice) && basePrice >= 0
                              ? basePrice * (1 + marginDecimal)
                              : Number.NaN;

                          return (
                            <TableRow
                              key={`${offer.id_supplier}-${offer.sku}`}
                              className={idx % 2 === 0 ? "bg-muted/20" : ""}
                            >
                              <TableCell className="text-sm font-medium">
                                {offer.supplier_name ??
                                  `Fornecedor #${offer.id_supplier}`}
                              </TableCell>
                              <TableCell className="font-mono text-sm text-right text-muted-foreground">
                                {Number.isFinite(basePrice)
                                  ? fmtPrice(basePrice)
                                  : "—"}
                              </TableCell>
                              <TableCell className="font-mono text-sm text-right font-semibold">
                                {Number.isFinite(priceWithMargin)
                                  ? fmtPrice(priceWithMargin)
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Este produto não tem ofertas ativas neste momento.
                  </div>
                )}
              </div>
            </div>

            {mutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive font-medium">
                  Erro ao atualizar a margem
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  {String(
                    (mutation.error as any)?.message ?? "Tente novamente."
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || marginDecimal < 0 || !hasChanged}
              className="px-6 bg-primary hover:bg-primary/90 cursor-pointer text-white dark:text-gray-800"
            >
              {isSaving ? "A guardar..." : "Guardar Margem"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
