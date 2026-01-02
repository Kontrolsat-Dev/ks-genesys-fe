// src/features/products/categories/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Settings2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Highlight from "@/components/genesys-ui/Hightlight";
import {
  useCategoriesList,
  useUpdateCategoryMapping,
  useDeleteCategoryMapping,
} from "./queries";
import { TableEmpty, TableSkeleton } from "@/features/products/components";
import useDebounced from "@/lib/debounce";
import { CategoryMappingModal } from "./components/category-mapping-modal";
import type { Category } from "@/api/categories";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [sp, setSp] = useSearchParams();

  const initialPage = Number(sp.get("page") ?? 1);
  const initialPageSize = Number(sp.get("page_size") ?? 20);
  const initialQ = sp.get("q") ?? "";

  const [page, setPage] = useState(
    Number.isFinite(initialPage) ? initialPage : 1
  );
  const [pageSize, setPageSize] = useState(
    Number.isFinite(initialPageSize) ? initialPageSize : 20
  );
  const [qInput, setQInput] = useState(initialQ);
  const q = useDebounced(qInput.trim(), 350) || null;

  // Auto-import filter state
  const initialAutoImport = sp.get("auto_import");
  const [autoImportFilter, setAutoImportFilter] = useState<boolean | null>(
    initialAutoImport === "true" ? true : initialAutoImport === "false" ? false : null
  );

  // Modal state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Mutations
  const updateMapping = useUpdateCategoryMapping();
  const deleteMapping = useDeleteCategoryMapping();

  useEffect(() => {
    const next = new URLSearchParams(sp);
    next.set("page", String(page));
    next.set("page_size", String(pageSize));
    if (q && q.length) next.set("q", q);
    else next.delete("q");
    if (autoImportFilter !== null) next.set("auto_import", String(autoImportFilter));
    else next.delete("auto_import");
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q]);

  useEffect(() => {
    setPage(1);
  }, [q, pageSize, autoImportFilter]);

  const { data, isLoading, isFetching } = useCategoriesList({
    page,
    pageSize,
    q: q ?? undefined,
    autoImport: autoImportFilter,
  });

  const items = data?.items ?? [];
  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1),
    [data]
  );
  const elapsedMs = (data as any)?.elapsedMs as number | undefined;

  const handleOpenMapping = (cat: Category) => {
    setSelectedCategory(cat);
    setModalOpen(true);
  };

  const handleSaveMapping = async (payload: {
    id_ps_category: number;
    ps_category_name: string;
    auto_import: boolean;
  }) => {
    if (!selectedCategory) return;
    try {
      await updateMapping.mutateAsync({
        id: selectedCategory.id,
        payload,
      });
      toast.success("Mapeamento guardado com sucesso");
      setModalOpen(false);
    } catch {
      toast.error("Erro ao guardar mapeamento");
    }
  };

  const handleDeleteMapping = async () => {
    if (!selectedCategory) return;
    try {
      await deleteMapping.mutateAsync(selectedCategory.id);
      toast.success("Mapeamento removido");
      setModalOpen(false);
    } catch {
      toast.error("Erro ao remover mapeamento");
    }
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Categorias</h1>
            <p className="text-sm text-muted-foreground">
              Lista de categorias disponíveis no catálogo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative w-[360px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-slate-400 pointer-events-none" />
              </span>
              <Input
                placeholder="Pesquisar categoria..."
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Auto-Import Filter */}
            <Select
              value={
                autoImportFilter === null
                  ? "all"
                  : autoImportFilter
                    ? "active"
                    : "inactive"
              }
              onValueChange={(v) =>
                setAutoImportFilter(
                  v === "all" ? null : v === "active" ? true : false
                )
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Auto-Import" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Auto-Import ✓</SelectItem>
                <SelectItem value="inactive">Sem Import</SelectItem>
              </SelectContent>
            </Select>

            {/* Page size */}
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tamanho" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}/página
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden p-0">
        <div className="min-w-full overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TableRow className="[&_th]:text-muted-foreground">
                <TableHead className="w-[30%]">Categoria</TableHead>
                <TableHead className="w-[20%]">Fornecedor</TableHead>
                <TableHead className="w-[20%]">PrestaShop</TableHead>
                <TableHead className="w-[10%] text-center">
                  Auto-Import
                </TableHead>
                <TableHead className="w-[20%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableSkeleton rows={10} cols={5} rightAlignCols={[4]} />
              )}

              {!isLoading && items.length === 0 && <TableEmpty />}

              {!isLoading &&
                items.map((cat) => (
                  <TableRow key={cat.id} className="group hover:bg-muted/30">
                    <TableCell className="truncate font-medium">
                      <Highlight text={cat.name} query={q ?? ""} />
                    </TableCell>
                    <TableCell>
                      {cat.supplier_source_name ? (
                        <span className="text-sm text-foreground">
                          {cat.supplier_source_name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cat.id_ps_category && cat.ps_category_name ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                              {cat.ps_category_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {cat.id_ps_category}
                              {(cat.default_ecotax > 0 || cat.default_extra_fees > 0) && (
                                <span className="ml-2 text-blue-600">
                                  {cat.default_ecotax > 0 && `Eco: €${cat.default_ecotax.toFixed(2)}`}
                                  {cat.default_ecotax > 0 && cat.default_extra_fees > 0 && " · "}
                                  {cat.default_extra_fees > 0 && `Tax: €${cat.default_extra_fees.toFixed(2)}`}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                            <XCircle className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Não mapeado
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {cat.auto_import ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Ativo
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleOpenMapping(cat)}
                        >
                          <Settings2 className="h-4 w-4" />
                          Mapear
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                        >
                          <Link
                            to={`/products?id_category=${cat.id}`}
                            title="Ver produtos"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Produtos
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
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
                {data?.total && data.total > 0 ? (
                  <>
                    <span className="font-medium text-foreground">
                      {data.total.toLocaleString()}
                    </span>{" "}
                    {data.total === 1 ? "resultado" : "resultados"}
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
                    <Loader2 className="h-3 w-3 animate-spin" />a atualizar
                  </span>
                </>
              )}
            </div>

            {/* Right: Pagination controls */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Página{" "}
                <span className="font-medium text-foreground">
                  {data?.page ?? page}
                </span>{" "}
                de{" "}
                <span className="font-medium text-foreground">
                  {totalPages}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={(data?.page ?? page) <= 1 || isFetching}
                  className="h-8 px-2.5 gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={(data?.page ?? page) >= totalPages || isFetching}
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

      {/* Mapping Modal */}
      <CategoryMappingModal
        category={selectedCategory}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveMapping}
        onDelete={handleDeleteMapping}
        isSaving={updateMapping.isPending}
        isDeleting={deleteMapping.isPending}
      />
    </div>
  );
}

