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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Ofertas Disponíveis
      </h3>
      <Card className="border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="font-semibold text-foreground">
                Fornecedor
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Preço
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Stock
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Run
              </TableHead>
              <TableHead className="w-[220px] font-semibold text-foreground">
                Atualizado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  Sem ofertas disponíveis
                </TableCell>
              </TableRow>
            ) : (
              offers.map((o, i) => (
                <TableRow
                  key={`${o.id_supplier}-${o.id_feed ?? "nofeed"}-${
                    o.sku ?? i
                  }`}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {o.supplier_image ? (
                        <img
                          src={o.supplier_image || "/placeholder.svg"}
                          alt={o.supplier_name ?? ""}
                          className="h-5 w-5 rounded-sm object-contain"
                        />
                      ) : null}
                      <span className="font-medium text-foreground">
                        {o.supplier_name ?? `#${o.id_supplier}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {fmtMoney(o.price)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {typeof o.stock === "number" ? o.stock : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
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
    </div>
  );
}
