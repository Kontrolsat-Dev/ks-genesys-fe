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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
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
import {
  useImportProduct,
  useUpdateProductMargin,
} from "@/features/products/product/queries";
import { toast } from "sonner";
import type { ProductOut, OfferOut } from "@/api/products/types";
import type { Category } from "@/api/categories/types";
import { fmtPrice } from "@/helpers/fmtPrices";
import { calculatePricePreview } from "@/helpers/priceRounding";
import { getBestOfferCost } from "@/helpers/offers";

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
  // Wizard step: 1 = categoria, 2 = margem e taxas
  const [step, setStep] = useState(1);
  const [selectedPsCategory, setSelectedPsCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [margin, setMargin] = useState(0);
  const [ecotax, setEcotax] = useState<string>("0");
  const [extraFees, setExtraFees] = useState<string>("0");
  const [autoImport, setAutoImport] = useState(false);

  const updateMapping = useUpdateCategoryMapping();
  const importProduct = useImportProduct(product.id);
  const updateMargin = useUpdateProductMargin(product.id);

  const categoryIsMapped = category?.id_ps_category != null;
  const isImporting =
    importProduct.isPending ||
    updateMapping.isPending ||
    updateMargin.isPending;

  // Margem atual em percentagem
  const currentMarginPct = useMemo(
    () => (typeof product.margin === "number" ? product.margin * 100 : 0),
    [product.margin]
  );
  const marginHasChanged = Math.abs(margin - currentMarginPct) > 0.1;
  const taxesHaveChanged =
    parseFloat(ecotax || "0") !== (product.ecotax || 0) ||
    parseFloat(extraFees || "0") !== (product.extra_fees || 0);

  // Custo da melhor oferta para prévia de preço
  const cost = getBestOfferCost(offers);
  const extraFeesNum = parseFloat(extraFees || "0");
  const ecotaxNum = parseFloat(ecotax || "0");

  // Usar helper de arredondamento para preview completa
  const pricePreview =
    cost !== null
      ? calculatePricePreview(cost, margin, ecotaxNum, extraFeesNum)
      : null;
  const priceWithMargin = pricePreview?.priceWithMargin ?? null;

  // Reset state quando modal abre
  useEffect(() => {
    if (open) {
      if (categoryIsMapped && category) {
        setSelectedPsCategory({
          id: category.id_ps_category!,
          name: category.ps_category_name || `PS #${category.id_ps_category}`,
        });
        setStep(1);
      } else {
        setSelectedPsCategory(null);
        setStep(1);
      }
      setMargin(currentMarginPct);
      // Inicializar taxas: se produto não importado, usar defaults da categoria
      // Se já importado, usar valores do produto
      const isNewProduct = !product.id_ecommerce;
      const defaultEcotax = isNewProduct
        ? category?.default_ecotax ?? 0
        : product.ecotax ?? 0;
      const defaultExtraFees = isNewProduct
        ? category?.default_extra_fees ?? 0
        : product.extra_fees ?? 0;
      setEcotax(defaultEcotax.toString());
      setExtraFees(defaultExtraFees.toString());
    }
  }, [
    open,
    category,
    categoryIsMapped,
    currentMarginPct,
    product.ecotax,
    product.extra_fees,
  ]);

  const handleImport = async () => {
    // Use selectedPsCategory se novo mapeamento, ou id existente se já mapeado
    const psCatId = selectedPsCategory?.id ?? category?.id_ps_category;
    if (!category || !psCatId) return;

    try {
      // Atualizar margem e taxas se alteradas
      if (marginHasChanged || taxesHaveChanged) {
        await updateMargin.mutateAsync({
          margin: margin / 100,
          ecotax: parseFloat(ecotax || "0"),
          extra_fees: parseFloat(extraFees || "0"),
        });
      }

      // Mapear categoria se não mapeada
      if (!categoryIsMapped && selectedPsCategory) {
        await updateMapping.mutateAsync({
          id: category.id,
          payload: {
            id_ps_category: selectedPsCategory.id,
            ps_category_name: selectedPsCategory.name,
            auto_import: autoImport,
          },
        });
      }

      // Importar produto
      const result = await importProduct.mutateAsync({
        id_ps_category: psCatId,
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
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
              <p className="text-xs text-muted-foreground uppercase font-medium">
                A mapear categoria:
              </p>
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
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                    {selectedPsCategory.name}
                  </span>
                </div>

                {/* Auto-import checkbox */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      Auto-importar produtos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Importar automaticamente novos produtos desta categoria
                    </p>
                  </div>
                  <Switch
                    checked={autoImport}
                    onCheckedChange={setAutoImport}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 2: MARGEM E PREÇO ===== */}
        {(categoryIsMapped || step === 2) && (
          <div className="py-4 space-y-4">
            {/* Header */}
            {!categoryIsMapped && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">Definir Preço</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  Passo 2 de 2
                </span>
              </div>
            )}

            {categoryIsMapped && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
                <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>
                  Categoria: <strong>{category?.ps_category_name}</strong>
                </span>
              </div>
            )}

            {/* Layout em 2 colunas */}
            <div className="grid grid-cols-2 gap-4">
              {/* Coluna Esquerda: Margem */}
              <div className="space-y-3">
                <div className="p-4 border rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-2">
                    Margem de Lucro
                  </p>

                  <div className="flex items-center justify-center gap-1 mb-3">
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
                      className="w-16 text-2xl font-bold text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Percent className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[margin]}
                    onValueChange={(v) => setMargin(v[0])}
                    className="mb-2"
                  />

                  {/* Presets compactos */}
                  <div className="flex gap-1 mt-3">
                    {[0, 15, 25, 35, 50].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setMargin(val)}
                        className={`flex-1 py-1 text-xs font-medium rounded transition-all ${
                          Math.abs(margin - val) < 0.5
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taxas */}
                <div className="p-4 border rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-3">
                    Taxas (opcional)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label
                        htmlFor="ecotax"
                        className="text-xs text-muted-foreground"
                      >
                        Ecotax €
                      </Label>
                      <Input
                        id="ecotax"
                        type="number"
                        step="0.01"
                        min="0"
                        value={ecotax}
                        onChange={(e) => setEcotax(e.target.value)}
                        placeholder="0"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="extra_fees"
                        className="text-xs text-muted-foreground"
                      >
                        Outras €
                      </Label>
                      <Input
                        id="extra_fees"
                        type="number"
                        step="0.01"
                        min="0"
                        value={extraFees}
                        onChange={(e) => setExtraFees(e.target.value)}
                        placeholder="0"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Resumo de Preço */}
              <div className="p-4 border rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/30 dark:to-teal-900/20 border-teal-200 dark:border-teal-800">
                <p className="text-xs text-teal-700 dark:text-teal-300 uppercase font-medium mb-3">
                  Resumo de Preço
                </p>

                {cost !== null && pricePreview !== null ? (
                  <div className="space-y-3">
                    {/* Custo base */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Custo</span>
                      <span className="font-mono">{fmtPrice(cost)}</span>
                    </div>

                    {/* Após margem */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        + Margem {margin.toFixed(0)}%
                      </span>
                      <span className="font-mono">
                        {fmtPrice(priceWithMargin ?? 0)}
                      </span>
                    </div>

                    {/* Taxas (se houver) */}
                    {(extraFeesNum > 0 || ecotaxNum > 0) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">+ Taxas</span>
                        <span className="font-mono">
                          {fmtPrice(extraFeesNum + ecotaxNum)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-teal-200 dark:border-teal-800 pt-3">
                      {/* Preço sem IVA */}
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-muted-foreground">
                          Preço s/ IVA
                        </span>
                        <span className="font-mono">
                          {fmtPrice(pricePreview.finalPriceNoVat)}
                        </span>
                      </div>

                      {/* Preço com IVA - destaque */}
                      <div className="flex justify-between items-center">
                        <span className="text-teal-700 dark:text-teal-300 font-medium">
                          Preço c/ IVA
                        </span>
                        <span className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                          {fmtPrice(pricePreview.roundedVat)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Sem oferta disponível
                  </p>
                )}
              </div>
            </div>
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
