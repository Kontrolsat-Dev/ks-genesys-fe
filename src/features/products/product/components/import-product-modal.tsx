// src/features/products/product/components/import-product-modal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle, AlertTriangle, Upload } from "lucide-react";
import { PsCategoryTree } from "@/features/products/categories/components/ps-category-tree";
import { useUpdateCategoryMapping } from "@/features/products/categories/queries";
import { toast } from "sonner";
import type { ProductOut } from "@/api/products/types";
import type { Category } from "@/api/categories/types";

type Props = {
  product: ProductOut;
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
};

export function ImportProductModal({
  product,
  category,
  open,
  onOpenChange,
  onImportSuccess,
}: Props) {
  const [selectedPsCategory, setSelectedPsCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [autoImport, setAutoImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const updateMapping = useUpdateCategoryMapping();

  const categoryIsMapped = category?.id_ps_category != null;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      if (categoryIsMapped && category) {
        setSelectedPsCategory({
          id: category.id_ps_category!,
          name: category.ps_category_name || `PS #${category.id_ps_category}`,
        });
      } else {
        setSelectedPsCategory(null);
      }
      setAutoImport(false);
    }
  }, [open, category, categoryIsMapped]);

  const handleImport = async () => {
    if (!category) return;

    setIsImporting(true);

    try {
      // If category wasn't mapped, save the mapping first
      if (!categoryIsMapped && selectedPsCategory) {
        await updateMapping.mutateAsync({
          id: category.id,
          payload: {
            id_ps_category: selectedPsCategory.id,
            ps_category_name: selectedPsCategory.name,
            auto_import: autoImport,
          },
        });
        toast.success(`Categoria "${category.name}" mapeada para PS`);
      }

      // TODO: Call actual import API when backend is ready
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success(`Produto "${product.name}" pronto para importação`);
      onOpenChange(false);
      onImportSuccess();
    } catch (error) {
      toast.error("Erro ao processar importação");
    } finally {
      setIsImporting(false);
    }
  };

  const canImport =
    categoryIsMapped || (selectedPsCategory !== null && category !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Produto
          </DialogTitle>
          <DialogDescription>
            {product.name || `Produto #${product.id}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category status */}
          {categoryIsMapped ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Categoria já mapeada
                </p>
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">{category?.name}</span> →{" "}
                  <span className="text-emerald-600">
                    {category?.ps_category_name} (PS #{category?.id_ps_category}
                    )
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Categoria não mapeada
                  </p>
                  <p className="text-sm text-amber-700">
                    A categoria{" "}
                    <span className="font-medium">
                      "{category?.name || product.category_name}"
                    </span>{" "}
                    precisa de ser mapeada para uma categoria PrestaShop.
                  </p>
                </div>
              </div>

              {/* Category tree selector */}
              <div className="space-y-2">
                <Label>Selecionar categoria PrestaShop</Label>
                <PsCategoryTree
                  selectedId={selectedPsCategory?.id ?? null}
                  onSelect={setSelectedPsCategory}
                />
              </div>

              {/* Selected category confirmation */}
              {selectedPsCategory && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-emerald-700">
                    <span className="font-medium">
                      {selectedPsCategory.name}
                    </span>{" "}
                    <span className="text-emerald-500">
                      (ID: {selectedPsCategory.id})
                    </span>
                  </p>
                </div>
              )}

              {/* Auto-import toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="auto_import_modal">Auto-Import</Label>
                  <p className="text-xs text-muted-foreground">
                    Importar automaticamente futuros produtos desta categoria
                  </p>
                </div>
                <Switch
                  id="auto_import_modal"
                  checked={autoImport}
                  onCheckedChange={setAutoImport}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport || isImporting}
            className="gap-2"
          >
            {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
            {categoryIsMapped ? "Importar Produto" : "Mapear e Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
