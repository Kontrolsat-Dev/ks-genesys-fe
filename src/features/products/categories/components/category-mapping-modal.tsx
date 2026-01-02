// src/features/products/categories/category-mapping-modal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle, Euro } from "lucide-react";
import type { Category } from "@/api/categories";
import { PsCategoryTree } from "./ps-category-tree";

type Props = {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    id_ps_category: number;
    ps_category_name: string;
    auto_import: boolean;
    default_ecotax?: number | null;
    default_extra_fees?: number | null;
  }) => void;
  onDelete: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
};

export function CategoryMappingModal({
  category,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: Props) {
  const [selectedPsCategory, setSelectedPsCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [autoImport, setAutoImport] = useState(false);
  const [ecotax, setEcotax] = useState<string>("");
  const [extraFees, setExtraFees] = useState<string>("");

  const hasMapping = category?.id_ps_category != null;

  // Reset form quando categoria muda
  useEffect(() => {
    if (category && open) {
      if (category.id_ps_category && category.ps_category_name) {
        setSelectedPsCategory({
          id: category.id_ps_category,
          name: category.ps_category_name,
        });
      } else {
        setSelectedPsCategory(null);
      }
      setAutoImport(category.auto_import ?? false);
      setEcotax(category.default_ecotax?.toString() ?? "0");
      setExtraFees(category.default_extra_fees?.toString() ?? "0");
    }
  }, [category, open]);

  const handleSave = () => {
    if (!selectedPsCategory) return;
    onSave({
      id_ps_category: selectedPsCategory.id,
      ps_category_name: selectedPsCategory.name,
      auto_import: autoImport,
      default_ecotax: ecotax ? parseFloat(ecotax) : null,
      default_extra_fees: extraFees ? parseFloat(extraFees) : null,
    });
  };

  const canSave = selectedPsCategory !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Mapeamento PrestaShop - {category?.name ?? "Categoria"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Categoria selecionada */}
          {selectedPsCategory && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Categoria selecionada
                </p>
                <p className="text-sm text-green-700">
                  {selectedPsCategory.name}{" "}
                  <span className="text-green-500">
                    (ID: {selectedPsCategory.id})
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Seletor de categoria */}
          <div className="space-y-2">
            <Label>Selecionar categoria PrestaShop</Label>
            <PsCategoryTree
              selectedId={selectedPsCategory?.id ?? null}
              onSelect={setSelectedPsCategory}
            />
          </div>

          {/* Taxas - Layout simples em linha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ecotax" className="flex items-center gap-1.5">
                <Euro className="h-3.5 w-3.5 text-muted-foreground" />
                Ecotax
              </Label>
              <Input
                id="ecotax"
                type="number"
                step="0.01"
                min="0"
                value={ecotax}
                onChange={(e) => setEcotax(e.target.value)}
                placeholder="0.00"
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">
                Enviado separadamente ao PrestaShop
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="extra_fees" className="flex items-center gap-1.5">
                <Euro className="h-3.5 w-3.5 text-muted-foreground" />
                Taxas Adicionais
              </Label>
              <Input
                id="extra_fees"
                type="number"
                step="0.01"
                min="0"
                value={extraFees}
                onChange={(e) => setExtraFees(e.target.value)}
                placeholder="0.00"
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">
                Soma ao custo antes da margem
              </p>
            </div>
          </div>

          {/* Toggle de auto-import */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="auto_import">Auto-Import</Label>
              <p className="text-xs text-muted-foreground">
                Importar automaticamente novos produtos desta categoria
              </p>
            </div>
            <Switch
              id="auto_import"
              checked={autoImport}
              onCheckedChange={setAutoImport}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {hasMapping && (
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting || isSaving}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remover Mapeamento
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!canSave || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
