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
import { Switch } from "@/components/ui/switch";
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

const VAT_RATE = 0.23; // 23% IVA Portugal

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
  const [includeVat, setIncludeVat] = useState(false);

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

  // Calcula preço com ou sem IVA
  const calculatePrice = (basePrice: number, withVat: boolean) => {
    const priceWithMargin = basePrice * (1 + marginDecimal);
    return withVat ? priceWithMargin * (1 + VAT_RATE) : priceWithMargin;
  };

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
                className={`rounded-lg border-2 p-4 transition-colors ${hasChanged
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Ajustar margem</label>
                  <div className="flex items-center gap-1.5 bg-muted/80 rounded-lg px-1 py-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={percent.toFixed(1)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (Number.isFinite(val)) {
                          setPercent(Math.max(0, Math.min(100, val)));
                        }
                      }}
                      className="w-16 h-8 px-2 text-center font-mono text-base font-semibold text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm font-medium text-muted-foreground pr-1">%</span>
                  </div>
                </div>

                <Slider
                  min={0}
                  max={100}
                  step={0.5}
                  value={[percent]}
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : 0;
                    setPercent(val);
                  }}
                  className="w-full"
                />

                <div className="flex justify-between text-[10px] text-muted-foreground/60 px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Impacto nas Ofertas</h3>

                {/* Toggle IVA */}
                <div className="flex items-center gap-3">
                  {includeVat && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      +23%
                    </span>
                  )}
                  <span className={`text-xs font-medium transition-colors ${!includeVat ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Sem IVA
                  </span>
                  <Switch
                    checked={includeVat}
                    onCheckedChange={setIncludeVat}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className={`text-xs font-medium transition-colors ${includeVat ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Com IVA
                  </span>

                </div>
              </div>

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
                            Preço Final {includeVat ? "(c/ IVA)" : "(s/ IVA)"}
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
                              ? calculatePrice(basePrice, includeVat)
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

