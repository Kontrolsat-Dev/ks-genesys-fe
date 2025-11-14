import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductMeta } from "@/api/products/types";
import { fmtDate } from "./product-utils";

type Props = { meta: ProductMetaOut[] };

export default function ProductMetaTable({ meta }: Props) {
  return (
    <Card className="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="w-[180px]">Criado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meta.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-sm text-muted-foreground"
              >
                Sem meta registada
              </TableCell>
            </TableRow>
          ) : (
            meta.map((m, idx) => (
              <TableRow key={`${m?.name ?? "meta"}-${idx}`}>
                <TableCell className="font-medium">
                  {String(m?.name ?? "—")}
                </TableCell>
                <TableCell className="break-all">
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
  );
}
