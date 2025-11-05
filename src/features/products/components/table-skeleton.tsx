// src/features/products/components/table-skeleton.tsx
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Props = {
  rows?: number; // nº de linhas
  cols?: number; // nº de colunas
  rightAlignCols?: number[]; // índices (0-based) a alinhar à direita
  showAvatarOnCol0?: boolean; // mostra o “círculo” na 1ª coluna
};

export default function TableSkeleton({
  rows = 10,
  cols = 7,
  rightAlignCols = [4, 5],
  showAvatarOnCol0 = true,
}: Props) {
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
