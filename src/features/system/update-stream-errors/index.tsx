// src/features/catalog/update-stream/UpdateStreamErrorPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import { fmtDate } from "@/helpers/fmtDate";

type CatalogUpdateStreamItem = {
  id: number;
  id_product: number;
  id_ecommerce: number | null;

  status: "pending" | "processing" | "done" | "failed" | string;
  event_type: string;
  priority: number;
  attempts: number;
  last_error: string | null;

  created_at: string;
  processed_at: string | null;
};

type CatalogUpdateStreamListResponse = {
  items: CatalogUpdateStreamItem[];
  total: number;
  page: number;
  page_size: number;
};

const client = new HttpClient({
  baseUrl: Endpoints.BASE_URL,
  token: () => authStore.get(),
});

function useCatalogUpdateErrors(page: number, pageSize: number) {
  return useQuery<CatalogUpdateStreamListResponse>({
    queryKey: ["catalog-update-stream", "errors", page, pageSize],
    queryFn: () =>
      client.get<CatalogUpdateStreamListResponse>(
        Endpoints.CATALOG_UPDATE_STREAM_ERRORS,
        {
          params: {
            page,
            page_size: pageSize,
          },
        }
      ),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

function statusBadgeVariant(
  status: string
): "default" | "outline" | "secondary" | "destructive" {
  switch (status) {
    case "failed":
      return "destructive";
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "done":
      return "outline";
    default:
      return "outline";
  }
}

export default function UpdateStreamErrorPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isFetching, error } = useCatalogUpdateErrors(
    page,
    pageSize
  );

  const total = data?.total ?? 0;
  const hasNext = total > page * pageSize;
  const hasPrev = page > 1;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Erros de sincronização (DLQ)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Eventos da fila de atualização de catálogo que falharam ao ser
            aplicados no PrestaShop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            Total erros:{" "}
            <span className="font-semibold text-foreground">{total}</span>
          </div>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 mb-2">
            <p className="text-sm text-destructive font-medium">
              Não foi possível carregar os eventos de erro.
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              {String((error as any)?.message ?? "Tente novamente mais tarde.")}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            A carregar eventos com erro...
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Não há eventos com erro na fila neste momento.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[100px]">Produto</TableHead>
                    <TableHead className="w-[90px]">Loja</TableHead>
                    <TableHead className="w-[110px]">Estado</TableHead>
                    <TableHead className="w-[110px]">Tipo</TableHead>
                    <TableHead className="w-[90px] text-right">
                      Prioridade
                    </TableHead>
                    <TableHead className="w-[90px] text-right">
                      Tentativas
                    </TableHead>
                    <TableHead>Erro</TableHead>
                    <TableHead className="w-[120px]">Criado</TableHead>
                    <TableHead className="w-[120px]">Processado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        #{item.id}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {item.id_product ? (
                          // link para a página de produto
                          <a
                            href={`/products/${item.id_product}`}
                            className="underline hover:no-underline"
                          >
                            #{item.id_product}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {item.id_ecommerce ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(item.status)}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {item.event_type || "product_state_changed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right">
                        {item.priority}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right">
                        {item.attempts}
                      </TableCell>
                      <TableCell className="text-xs max-w-xs">
                        {item.last_error ? (
                          <span title={item.last_error}>{item.last_error}</span>
                        ) : (
                          <span className="text-muted-foreground">
                            Sem mensagem de erro
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {fmtDate(item.created_at)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.processed_at ? fmtDate(item.processed_at) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                Página{" "}
                <span className="font-semibold text-foreground">
                  {data.page}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-foreground">
                  {Math.max(1, Math.ceil(total / data.page_size))}
                </span>{" "}
                ·{" "}
                <span className="font-mono">
                  {data.items.length}/{data.page_size}
                </span>{" "}
                registos
                {isFetching && (
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    a atualizar...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrev || isFetching}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || isFetching}
                >
                  Seguinte
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
