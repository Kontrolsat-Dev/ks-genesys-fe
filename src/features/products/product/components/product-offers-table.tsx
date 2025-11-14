import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OfferOut } from "@/api/products/types";
import { fmtMoney } from "@/helpers/fmtPrices";
import { fmtDate } from "@/helpers/fmtDate";

type Props = { offers: OfferOut[] };

export default function ProductOffersTable({ offers }: Props) {
  return (
    <Card className="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Run</TableHead>
            <TableHead className="w-[220px]">Atualizado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-sm text-muted-foreground"
              >
                Sem ofertas
              </TableCell>
            </TableRow>
          ) : (
            offers.map((o, i) => (
              <TableRow
                key={`${o.id_supplier}-${o.id_feed ?? "nofeed"}-${o.sku ?? i}`}
              >
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {o.supplier_image ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <img
                        src={o.supplier_image}
                        alt={o.supplier_name ?? ""}
                        className="h-5 w-5 rounded-sm object-contain"
                      />
                    ) : null}
                    <span className="font-medium">
                      {o.supplier_name ?? `#${o.id_supplier}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{fmtMoney(o.price)}</TableCell>
                <TableCell>
                  {typeof o.stock === "number" ? o.stock : "—"}
                </TableCell>
                <TableCell className="text-xs">
                  {o.id_last_seen_run ?? "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {fmtDate(o.updated_at)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
