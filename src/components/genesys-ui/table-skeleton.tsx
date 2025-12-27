// src/components/genesys-ui/table-skeleton.tsx
// Componente de skeleton para tabelas

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  /** Número de linhas skeleton */
  rows?: number;
  /** Número de colunas */
  cols?: number;
  /** Índices (0-based) de colunas a alinhar à direita */
  rightAlignCols?: number[];
  /** Mostra círculo de avatar na primeira coluna */
  showAvatarOnCol0?: boolean;
};

export function TableSkeleton({
  rows = 10,
  cols = 7,
  rightAlignCols = [],
  showAvatarOnCol0 = false,
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={`sk-${r}`} className="hover:bg-transparent">
          {Array.from({ length: cols }).map((__, c) => (
            <TableCell key={`skc-${r}-${c}`} className="py-4">
              <div
                className={cn(
                  "flex items-center gap-2",
                  rightAlignCols.includes(c) && "justify-end"
                )}
              >
                <div className="h-4 w-full max-w-[220px] animate-pulse rounded bg-muted" />
                {showAvatarOnCol0 && c === 0 && (
                  <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
                )}
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
