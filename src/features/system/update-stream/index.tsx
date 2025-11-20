// src/features/system/update-stream/index.tsx
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CatalogUpdateStatus,
  CatalogUpdateStreamItem,
} from "@/api/system/types";
import { useUpdateStreamList } from "./queries";
import { fmtPrice } from "@/helpers/fmtPrices";

type StatusFilter = CatalogUpdateStatus | "all";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "Todos",
  pending: "Pendentes",
  processing: "Em curso",
  done: "Concluídos",
  failed: "Erros",
};

function statusBadgeVariant(status: CatalogUpdateStatus) {
  switch (status) {
    case "pending":
      return "outline" as const;
    case "processing":
      return "secondary" as const;
    case "done":
      return "default" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-PT");
}

function productLabel(item: CatalogUpdateStreamItem): string {
  const p = item.payload?.product;
  if (p?.name) return p.name;
  if (p?.gtin) return p.gtin;
  if (p?.partnumber) return p.partnumber;
  return `#${item.id_product}`;
}

function formatReason(reason?: string): string {
  if (!reason) return "—";
  if (reason === "margin_update") return "Atualização de margem";
  // futuros reasons ficam como estão por agora
  return reason;
}

function formatChangeSummary(item: CatalogUpdateStreamItem): string {
  const p = item.payload?.product;
  const ao = item.payload?.active_offer;

  const parts: string[] = [];

  if (typeof p?.margin === "number") {
    parts.push(`Margem: ${(p.margin * 100).toFixed(0)}%`);
  }

  if (typeof ao?.unit_price_sent === "number") {
    parts.push(`Preço: ${fmtPrice(ao.unit_price_sent)}`);
  }

  if (typeof ao?.stock_sent === "number") {
    parts.push(`Stock: ${ao.stock_sent}`);
  }

  if (parts.length === 0) {
    return "—";
  }

  return parts.join(" · ");
}

export default function UpdateStreamPage() {
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);
  const page_size = 20;

  // Se status === "all" não mandamos status para o backend (lista todos)
  const listParams =
    status === "all" ? { page, page_size } : { status, page, page_size };

  const { data, isLoading, isFetching, error } =
    useUpdateStreamList(listParams);

  const totalPages = useMemo(() => {
    if (!data || data.total <= 0) return 1;
    return Math.max(1, Math.ceil(data.total / data.page_size));
  }, [data]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleChangeStatus = (next: StatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            Fila de Atualizações de Catálogo
          </h1>
          <p className="text-sm text-muted-foreground">
            Eventos enviados para sincronizar produtos com o PrestaShop:
            pendentes, em processamento, concluídos e com erro. Vê o motivo e o
            impacto em cada produto.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            ["all", "pending", "processing", "done", "failed"] as StatusFilter[]
          ).map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => handleChangeStatus(s)}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </Card>

      {error && (
        <Card className="p-4 border border-destructive bg-destructive/5">
          <p className="text-sm text-destructive font-medium">
            Não foi possível carregar a fila de atualizações.
          </p>
          <p className="text-xs text-destructive/80 mt-1">
            {String((error as any)?.message ?? "Erro desconhecido")}
          </p>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Estado:</span>
            <Badge variant="outline">{STATUS_LABELS[status]}</Badge>
            {isFetching && (
              <span className="text-xs text-muted-foreground">
                A atualizar…
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Página {data?.page ?? page} de {totalPages} · {data?.total ?? 0}{" "}
            eventos
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[220px]">Produto</TableHead>
                <TableHead className="w-[160px]">Motivo</TableHead>
                <TableHead className="w-[260px]">Alteração</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[90px] text-right">
                  Prioridade
                </TableHead>
                <TableHead className="w-[90px] text-right">
                  Tentativas
                </TableHead>
                <TableHead>Erro</TableHead>
                <TableHead className="w-[180px]">Criado</TableHead>
                <TableHead className="w-[180px]">Processado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !data && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    A carregar eventos...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && data && data.items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Não há eventos para o filtro selecionado.
                  </TableCell>
                </TableRow>
              )}

              {data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    #{item.id}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium truncate">
                      {productLabel(item)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Produto #{item.id_product}
                      {item.id_ecommerce
                        ? ` · Ecommerce #${item.id_ecommerce}`
                        : ""}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatReason(item.payload?.reason)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatChangeSummary(item)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(item.status)}>
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono">
                    {item.priority}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono">
                    {item.attempts}
                  </TableCell>
                  <TableCell
                    className="text-xs max-w-[260px] truncate"
                    title={item.last_error ?? undefined}
                  >
                    {item.last_error ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(item.created_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(item.processed_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t text-xs">
          <div className="text-muted-foreground">
            {data?.total ?? 0} eventos no total
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => canNext && setPage((p) => p + 1)}
            >
              Seguinte
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
