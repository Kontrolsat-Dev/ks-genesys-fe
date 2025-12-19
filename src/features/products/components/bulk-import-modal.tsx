// src/features/products/components/bulk-import-modal.tsx
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Upload,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Pencil,
  X,
} from "lucide-react";
import { PsCategoryTree } from "@/features/products/categories/components/ps-category-tree";
import { useUpdateCategoryMapping } from "@/features/products/categories/queries";
import { useBulkImport } from "@/features/products/queries";
import { toast } from "sonner";
import type { ProductExt } from "@/api/products/types";
import type { Category } from "@/api/categories/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: Set<number>;
  products: ProductExt[];
  categories: Category[];
  onSuccess: () => void;
};

type CategoryGroup = {
  key: string;
  category: Category | null;
  categoryName: string;
  products: ProductExt[];
  psCategoryId: number | null;
  psCategoryName: string | null;
  isMapped: boolean;
};

export default function BulkImportModal({
  open,
  onOpenChange,
  selectedIds,
  products,
  categories,
  onSuccess,
}: Props) {
  // Track which categories user wants to edit/override
  const [categoryMappings, setCategoryMappings] = useState<
    Record<string, { id: number; name: string }>
  >({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [importState, setImportState] = useState<"idle" | "importing" | "done">("idle");
  const [importProgress, setImportProgress] = useState(0);

  const updateMapping = useUpdateCategoryMapping();
  const bulkImport = useBulkImport();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCategoryMappings({});
      setEditingKey(null);
      setExpandedKeys(new Set());
      setImportState("idle");
      setImportProgress(0);
    }
  }, [open]);

  // Group selected products by category
  const categoryGroups = useMemo((): CategoryGroup[] => {
    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    const grouped = new Map<string, ProductExt[]>();

    for (const p of selectedProducts) {
      const key = p.id_category ? `cat-${p.id_category}` : "no-category";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(p);
    }

    return Array.from(grouped.entries()).map(([key, prods]) => {
      const catId = key.startsWith("cat-") ? parseInt(key.replace("cat-", "")) : null;
      const category = catId ? categories.find((c) => c.id === catId) ?? null : null;
      const hasPsMapping = category?.id_ps_category != null;

      return {
        key,
        category,
        categoryName: category?.name ?? "Sem categoria",
        products: prods,
        psCategoryId: category?.id_ps_category ?? null,
        psCategoryName: category?.ps_category_name ?? null,
        isMapped: hasPsMapping,
      };
    });
  }, [products, selectedIds, categories]);

  // Get effective PS category for a group (user override or existing)
  const getEffectivePsCategory = (group: CategoryGroup) => {
    if (categoryMappings[group.key]) {
      return categoryMappings[group.key];
    }
    if (group.isMapped && group.category) {
      return {
        id: group.psCategoryId!,
        name: group.psCategoryName ?? `PS #${group.psCategoryId}`,
      };
    }
    return null;
  };

  const allHaveMapping = categoryGroups.every((g) => getEffectivePsCategory(g) !== null);
  const totalProducts = categoryGroups.reduce((sum, g) => sum + g.products.length, 0);
  const unmappedCount = categoryGroups.filter((g) => getEffectivePsCategory(g) === null).length;

  const handlePsCategorySelect = (key: string, psCategory: { id: number; name: string }) => {
    setCategoryMappings((prev) => ({ ...prev, [key]: psCategory }));
    setEditingKey(null);
  };

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleImport = async () => {
    setImportState("importing");
    setImportProgress(10);

    try {
      // 1. Save new/updated category mappings
      const mappingsToSave = categoryGroups.filter((g) => {
        if (!g.category) return false;
        const override = categoryMappings[g.key];
        return override && (!g.isMapped || override.id !== g.psCategoryId);
      });

      for (const group of mappingsToSave) {
        if (!group.category) continue;
        const mapping = categoryMappings[group.key];
        if (!mapping) continue;

        await updateMapping.mutateAsync({
          id: group.category.id,
          payload: {
            id_ps_category: mapping.id,
            ps_category_name: mapping.name,
            auto_import: false,
          },
        });
      }

      setImportProgress(30);

      // 2. Call bulk import API
      const productIds = Array.from(selectedIds);
      const result = await bulkImport.mutateAsync({ product_ids: productIds });

      setImportProgress(100);
      setImportState("done");

      if (result.imported > 0) {
        toast.success(`Importados ${result.imported} de ${result.total} produtos`, {
          description:
            result.failed > 0
              ? `${result.failed} falharam, ${result.skipped} já importados`
              : result.skipped > 0
              ? `${result.skipped} já estavam importados`
              : undefined,
        });
      } else if (result.skipped === result.total) {
        toast.info("Todos os produtos já estavam importados");
      } else {
        toast.error(`Falha ao importar ${result.failed} produtos`);
      }

      setTimeout(() => onSuccess(), 1500);
    } catch (error: any) {
      setImportState("idle");
      toast.error(error?.message || "Erro ao importar produtos");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <DialogHeader className="px-8 py-6 border-b bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Importar para PrestaShop
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {totalProducts} {totalProducts === 1 ? "produto selecionado" : "produtos selecionados"} em{" "}
                {categoryGroups.length} {categoryGroups.length === 1 ? "categoria" : "categorias"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-hidden">
          {importState === "importing" ? (
            /* IMPORTING STATE */
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
              <p className="text-xl font-medium mb-2">A importar produtos...</p>
              <p className="text-muted-foreground mb-8">{importProgress}% concluído</p>
              <div className="w-full max-w-md bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          ) : importState === "done" ? (
            /* DONE STATE */
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <CheckCircle2 className="h-20 w-20 text-emerald-500 mb-6" />
              <p className="text-2xl font-semibold">Importação concluída!</p>
            </div>
          ) : (
            /* IDLE STATE - Category List */
            <ScrollArea className="flex-1 h-full">
              <div className="px-8 py-6">
                {/* Instructions */}
                <div className="mb-8 p-5 bg-muted/30 rounded-xl border border-dashed">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Como funciona
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cada categoria Genesys precisa de estar mapeada para uma categoria PrestaShop.
                    {unmappedCount > 0 && (
                      <span className="text-amber-600 font-medium">
                        {" "}Tem {unmappedCount} {unmappedCount === 1 ? "categoria" : "categorias"} por mapear.
                      </span>
                    )}
                    {allHaveMapping && (
                      <span className="text-emerald-600 font-medium">
                        {" "}Todas as categorias estão mapeadas. Pronto para importar!
                      </span>
                    )}
                  </p>
                </div>

                {/* Category Cards */}
                <div className="space-y-6">
                  {categoryGroups.map((group) => {
                    const effectivePs = getEffectivePsCategory(group);
                    const isEditing = editingKey === group.key;
                    const isExpanded = expandedKeys.has(group.key);
                    const needsMapping = !effectivePs && group.category;

                    return (
                      <div
                        key={group.key}
                        className={cn(
                          "rounded-2xl border-2 overflow-hidden transition-all",
                          needsMapping
                            ? "border-amber-300 bg-amber-50/30 dark:bg-amber-950/10"
                            : "border-border bg-background"
                        )}
                      >
                        {/* Category Header */}
                        <div className="p-6">
                          <div className="flex items-start gap-5">
                            {/* Icon */}
                            <div
                              className={cn(
                                "p-3 rounded-xl shrink-0",
                                needsMapping ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"
                              )}
                            >
                              <FolderOpen
                                className={cn(
                                  "h-6 w-6",
                                  needsMapping ? "text-amber-600" : "text-muted-foreground"
                                )}
                              />
                            </div>

                            {/* Category Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-semibold truncate">
                                  {group.categoryName}
                                </h4>
                                <Badge variant="secondary" className="shrink-0">
                                  {group.products.length}{" "}
                                  {group.products.length === 1 ? "produto" : "produtos"}
                                </Badge>
                              </div>

                              {/* Mapping Status */}
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-sm text-muted-foreground">
                                  Categoria PrestaShop:
                                </span>
                                {effectivePs ? (
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant="outline"
                                      className="text-sm px-3 py-1 border-emerald-400 text-emerald-600 dark:text-emerald-400 gap-2"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      {effectivePs.name}
                                    </Badge>
                                    {group.category && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-foreground gap-1.5"
                                        onClick={() =>
                                          setEditingKey(isEditing ? null : group.key)
                                        }
                                      >
                                        <Pencil className="h-4 w-4" />
                                        Alterar
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-sm px-3 py-1 border-amber-400 text-amber-600 gap-2"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                    Não mapeada
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Expand Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => toggleExpanded(group.key)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </Button>
                          </div>

                          {/* Category Tree Selector */}
                          {(isEditing || (needsMapping)) && (
                            <div className="mt-6 pt-6 border-t border-dashed">
                              <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium">
                                  Selecionar categoria PrestaShop
                                </label>
                                {isEditing && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingKey(null)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancelar
                                  </Button>
                                )}
                              </div>
                              <div className="bg-background rounded-xl border p-4">
                                <PsCategoryTree
                                  selectedId={effectivePs?.id ?? null}
                                  onSelect={(cat) => handlePsCategorySelect(group.key, cat)}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expanded Products List */}
                        {isExpanded && (
                          <div className="px-6 pb-6">
                            <div className="pt-6 border-t">
                              <h5 className="text-sm font-medium text-muted-foreground mb-4">
                                Produtos nesta categoria
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {group.products.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                                  >
                                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-sm truncate">
                                      {p.name || `Produto #${p.id}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <DialogFooter className="px-8 py-5 border-t bg-muted/20">
          <div className="flex items-center justify-between w-full gap-4">
            {/* Warning */}
            {!allHaveMapping && importState === "idle" && (
              <div className="flex items-center gap-3 text-amber-600">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">
                  Configure todas as categorias para continuar
                </span>
              </div>
            )}
            {allHaveMapping && importState === "idle" && (
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">
                  Pronto para importar
                </span>
              </div>
            )}
            {importState !== "idle" && <div />}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
              >
                {importState === "done" ? "Fechar" : "Cancelar"}
              </Button>
              {importState === "idle" && (
                <Button
                  size="lg"
                  onClick={handleImport}
                  disabled={!allHaveMapping || bulkImport.isPending}
                  className="min-w-[200px]"
                >
                  {bulkImport.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-5 w-5 mr-2" />
                  )}
                  Importar {totalProducts} {totalProducts === 1 ? "Produto" : "Produtos"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
