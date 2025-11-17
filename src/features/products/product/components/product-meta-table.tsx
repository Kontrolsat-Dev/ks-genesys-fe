import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductMetaOut } from "@/api/products/types";
import { fmtDate } from "@/helpers/fmtDate";

type Props = { meta: ProductMetaOut[] };

export default function ProductMetaTable({ meta }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Metadados do Produto
      </h3>
      <Card className="border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">
                Nome
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Valor
              </TableHead>
              <TableHead className="w-[180px] font-semibold text-foreground">
                Criado em
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meta.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={3}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  Sem metadados registados
                </TableCell>
              </TableRow>
            ) : (
              meta.map((m, idx) => (
                <TableRow
                  key={`${m?.name ?? "meta"}-${idx}`}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-semibold text-foreground">
                    {String(m?.name ?? "—")}
                  </TableCell>
                  <TableCell className="break-all text-foreground">
                    {String(m?.value ?? "—")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {fmtDate(m?.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
