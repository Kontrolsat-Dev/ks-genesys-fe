import type { Run } from "@/api/runs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";

type Props = {
  items?: Run[];
  isLoading?: boolean;
};

export default function RunsTable({ items = [], isLoading }: Props) {
  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">A carregar histórico...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        Sem histórico de execuções.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Linhas</TableHead>
              <TableHead className="text-right">Operações</TableHead>
              <TableHead className="text-right">Erros</TableHead>
              <TableHead className="text-right">Unseen</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Duração</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Explanatory Footer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p>
            <strong>Linhas</strong> = número de linhas lidas do ficheiro do fornecedor.
          </p>
          <p>
            <strong>Operações</strong> = total de escritas na base de dados (inclui inserção de metadados e atualizações de ofertas). Este valor pode exceder "Linhas" porque cada linha pode gerar várias operações.
          </p>
          <p>
            <strong>Unseen</strong> = produtos que existiam antes mas não apareceram nesta execução e tiveram o stock zerado.
          </p>
        </div>
      </div>
    </div>
  );
}

function RunRow({ run }: { run: Run }) {
  const statusConfig = useMemo(() => {
    switch (run.status) {
      case "ok":
        return {
          label: "Sucesso",
          icon: CheckCircle2,
          // Dark mode friendly: use semantic colors that adapt
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "error":
        return {
          label: "Erro",
          icon: XCircle,
          className: "bg-destructive/10 text-destructive border-destructive/20",
        };
      case "partial":
        return {
          label: "Parcial",
          icon: AlertCircle,
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      default:
        return {
          label: "A rodar",
          icon: Clock,
          className: "bg-primary/10 text-primary border-primary/20 animate-pulse",
        };
    }
  }, [run.status]);

  const Icon = statusConfig.icon;

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-mono text-xs text-muted-foreground">
        #{run.id}
      </TableCell>
      <TableCell className="text-sm font-medium">
        {run.supplier_name ?? "—"}
      </TableCell>
      <TableCell>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
            statusConfig.className
          )}
        >
          <Icon className="h-3 w-3" />
          {statusConfig.label}
        </div>
        {run.http_status && (
           <span className="ml-2 text-xs text-muted-foreground font-mono">HTTP {run.http_status}</span>
        )}
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">{run.rows_total.toLocaleString()}</TableCell>
      <TableCell className="text-right text-muted-foreground tabular-nums">{run.rows_changed.toLocaleString()}</TableCell>
      <TableCell className={cn("text-right tabular-nums", run.rows_failed > 0 ? "text-destructive font-medium" : "text-muted-foreground")}>
        {run.rows_failed.toLocaleString()}
      </TableCell>
      <TableCell className="text-right text-muted-foreground tabular-nums">{run.rows_unseen.toLocaleString()}</TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(run.started_at), "dd MMM HH:mm", { locale: pt })}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : "—"}
      </TableCell>
    </TableRow>
  );
}

