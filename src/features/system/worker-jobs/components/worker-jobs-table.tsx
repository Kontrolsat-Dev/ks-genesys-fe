// src/features/system/worker-jobs/components/worker-jobs-table.tsx
import type { WorkerJobItem } from "@/api/worker-jobs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { fmtDate } from "@/helpers/fmtDate";
import { truncate } from "@/helpers/strings";
import { FileQuestion } from "lucide-react";

type WorkerJobsTableProps = {
  items: WorkerJobItem[];
  loading: boolean;
};

export function WorkerJobsTable({ items, loading }: WorkerJobsTableProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base mb-1">Nenhum job encontrado</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Não foram encontrados jobs com os filtros atuais. Tenta ajustar os
          critérios de pesquisa.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TableRow className="[&_th]:text-muted-foreground">
          <TableHead className="w-[70px]">ID</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[90px] text-right">Tentativas</TableHead>
          <TableHead>Not Before</TableHead>
          <TableHead>Locked By</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Finished</TableHead>
          <TableHead className="min-w-[200px]">Erro</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((job) => (
          <TableRow key={job.id_job} className="group hover:bg-muted/30">
            <TableCell className="font-mono text-xs text-muted-foreground">
              {job.id_job}
            </TableCell>
            <TableCell className="font-mono text-xs truncate font-medium">
              {job.job_kind}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {job.job_key ?? "—"}
            </TableCell>
            <TableCell>
              <StatusBadge status={job.status} />
            </TableCell>
            <TableCell className="text-right text-xs font-medium">
              {job.attempts}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {fmtDate(job.not_before)}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {job.locked_by ?? "—"}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {fmtDate(job.started_at)}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {fmtDate(job.finished_at)}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground max-w-[260px]">
              {job.last_error ? (
                <span
                  className="text-red-600 dark:text-red-400"
                  title={job.last_error}
                >
                  {truncate(job.last_error, 120)}
                </span>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {fmtDate(job.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
