// src/features/products/brands/index.tsx
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, ExternalLink } from "lucide-react";
import Highlight from "@/components/genesys-ui/hightlight";
import { useBrandsList } from "./queries";
import { TableEmpty, TableSkeleton } from "@/features/products/components";

function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function BrandsPage() {
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

  useEffect(() => {
    const next = new URLSearchParams(sp);
    next.set("page", String(page));
    next.set("page_size", String(pageSize));
    if (q && q.length) next.set("q", q);
    else next.delete("q");
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q]);

  useEffect(() => {
    setPage(1);
  }, [q, pageSize]);

  const { data, isLoading, isFetching } = useBrandsList({
    page,
    pageSize,
    q: q ?? undefined,
  });

  const items = data?.items ?? [];
  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1),
    [data]
  );
  const elapsedMs = (data as any)?.elapsedMs as number | undefined;

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Marcas</h1>
            <p className="text-sm text-muted-foreground">
              Lista de marcas disponíveis no catálogo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative w-[360px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-slate-400 pointer-events-none" />
              </span>
              <Input
                placeholder="Pesquisar marca…"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                className="pl-8"
              />
            </div>

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

        <div className="mt-0 text-xs text-muted-foreground">
          {data
            ? `${data.total} resultados` +
              (typeof elapsedMs === "number"
                ? ` • ${Math.round(elapsedMs)} ms`
                : "") +
              (isFetching ? " • a atualizar…" : "")
            : "—"}
        </div>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden p-0">
        <div className="min-w-full overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TableRow className="[&_th]:text-muted-foreground">
                <TableHead className="w-[80%]">Marca</TableHead>
                <TableHead className="w-[20%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableSkeleton rows={10} cols={2} rightAlignCols={[1]} />
              )}

              {!isLoading && items.length === 0 && <TableEmpty />}

              {!isLoading &&
                items.map((b) => (
                  <TableRow key={b.id} className="group hover:bg-muted/30">
                    <TableCell className="truncate font-medium">
                      <Highlight text={b.name} query={q ?? ""} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                      >
                        <Link
                          to={`/products?id_brand=${b.id}`}
                          title="Ver produtos"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver produtos
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <Separator />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-xs text-muted-foreground">
            Página {data?.page ?? page} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={(data?.page ?? page) <= 1 || isFetching}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p + 1))}
              disabled={(data?.page ?? page) >= totalPages || isFetching}
            >
              Seguinte
            </Button>
            {isFetching && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </div>
        </div>
      </Card>
    </div>
  );
}
