// src/features/products/product/components/import-product-modal.tsx
// Modal de importação simplificada com fluxo wizard

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  CheckCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Percent,
} from "lucide-react";
import { PsCategoryTree } from "@/features/products/categories/components/ps-category-tree";
import { useUpdateCategoryMapping } from "@/features/products/categories/queries";
import { useImportProduct, useUpdateProductMargin } from "@/features/products/product/queries";
import { toast } from "sonner";
import type { ProductOut, OfferOut } from "@/api/products/types";
import type { Category } from "@/api/categories/types";
import { fmtPrice } from "@/helpers/fmtPrices";

type Props = {
  product: ProductOut;
  offers: OfferOut[];
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
};

export function ImportProductModal({
  product,
  offers,
  category,
  open,
  onOpenChange,
  onImportSuccess,
}: Props) {
  // Wizard step: 1 = category, 2 = margin
  const [step, setStep] = useState(1);
  const [selectedPsCategory, setSelectedPsCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [margin, setMargin] = useState(0);

  const updateMapping = useUpdateCategoryMapping();
  const importProduct = useImportProduct(product.id);
  const updateMargin = useUpdateProductMargin(product.id);

  const categoryIsMapped = category?.id_ps_category != null;
  const isImporting = importProduct.isPending || updateMapping.isPending || updateMargin.isPending;

  // Current margin in percentage
  const currentMarginPct = useMemo(
    () => (typeof product.margin === "number" ? product.margin * 100 : 0),
    [product.margin]
  );
  const marginHasChanged = Math.abs(margin - currentMarginPct) > 0.1;

  // Best offer for price preview
  const bestOffer = useMemo(() => {
    if (!offers || offers.length === 0) return null;
    return offers.reduce((best, offer) => {
      const bestPrice = best.price ? Number(best.price) : Infinity;
      const offerPrice = offer.price ? Number(offer.price) : Infinity;
      return offerPrice < bestPrice ? offer : best;
    }, offers[0]);
  }, [offers]);

  const cost = bestOffer?.price ? Number(bestOffer.price) : null;
  const finalPrice = cost !== null ? cost * (1 + margin / 100) : null;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      if (categoryIsMapped && category) {
        setSelectedPsCategory({
          id: category.id_ps_category!,
          name: category.ps_category_name || `PS #${category.id_ps_category}`,
        });
        setStep(1); // Go directly to margin step
      } else {
        setSelectedPsCategory(null);
        setStep(1); // Start at category step
      }
      setMargin(currentMarginPct);
    }
  }, [open, category, categoryIsMapped, currentMarginPct]);

  const handleImport = async () => {
    const psCat = selectedPsCategory;
    if (!category || !psCat) return;

    try {
      // Update margin if changed
      if (marginHasChanged) {
        await updateMargin.mutateAsync({ margin: margin / 100 });
      }

      // Map category if not mapped
      if (!categoryIsMapped) {
        await updateMapping.mutateAsync({
          id: category.id,
          payload: {
            id_ps_category: psCat.id,
            ps_category_name: psCat.name,
            auto_import: false,
          },
        });
      }

      // Import product
      const result = await importProduct.mutateAsync({
        id_ps_category: psCat.id,
      });

      if (result.success) {
        toast.success(`Produto importado! (PS ID: ${result.id_ecommerce})`);
        onOpenChange(false);
        onImportSuccess();
      } else {
        toast.error("Erro ao importar produto");
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao processar importação");
    }
  };

  const canProceed = categoryIsMapped || selectedPsCategory !== null;
  const isLastStep = categoryIsMapped || step === 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Upload className="h-5 w-5" />
            <span>Importar para PrestaShop</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground truncate">
            {product.name}
          </p>
        </DialogHeader>

        {/* ===== STEP 1: CATEGORIA (se não mapeada) ===== */}
        {!categoryIsMapped && step === 1 && (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <h3 className="font-semibold">Selecionar Categoria</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                Passo 1 de 2
              </span>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg mb-4">
              <p className="text-xs text-muted-foreground uppercase font-medium">A mapear categoria:</p>
              <p className="text-sm font-semibold">{category?.name}</p>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Seleciona onde este produto vai aparecer na loja:
            </p>

            <PsCategoryTree
              selectedId={selectedPsCategory?.id ?? null}
              onSelect={setSelectedPsCategory}
            />

            {selectedPsCategory && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {selectedPsCategory.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 2: MARGEM (ou step 1 se categoria já mapeada) ===== */}
        {(categoryIsMapped || step === 2) && (
          <div className="py-4">
            {!categoryIsMapped && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">Definir Margem</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  Passo 2 de 2
                </span>
              </div>
            )}

            {categoryIsMapped && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg mb-4">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">
                  Categoria: <strong>{category?.ps_category_name}</strong>
                </span>
              </div>
            )}

            {/* Margin display */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-5xl font-bold">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={margin.toFixed(1)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (Number.isFinite(val)) {
                      setMargin(Math.max(0, Math.min(100, val)));
                    }
                  }}
                  className="w-24 text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Percent className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Margem de lucro</p>
            </div>

            {/* Slider */}
            <div className="px-2 mb-6">
              <Slider
                min={0}
                max={100}
                step={0.5}
                value={[margin]}
                onValueChange={(v) => setMargin(v[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Quick presets */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 25, 50, 75, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMargin(val)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${Math.abs(margin - val) < 0.5
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted hover:bg-muted-foreground/20"
                    }`}
                >
                  {val}%
                </button>
              ))}
            </div>

            {/* Price preview */}
            {cost !== null && finalPrice !== null && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Custo</p>
                    <p className="text-lg font-mono">{fmtPrice(cost)}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-emerald-500" />
                  <div className="text-center">
                    <p className="text-xs text-emerald-700 uppercase font-medium">Preço Venda</p>
                    <p className="text-2xl font-bold text-emerald-700">{fmtPrice(finalPrice)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {!categoryIsMapped && step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}

          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleImport}
              disabled={!canProceed || isImporting}
              className="gap-2 min-w-[120px]"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Importar
            </Button>
          ) : (
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedPsCategory}
              className="gap-2"
            >
              Seguinte
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
