import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { ProductOut } from "@/api/products/types";
import { cx } from "./product-utils";

type Props = {
  product?: ProductOut;
  onBack: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export default function ProductHeader({
  product: p,
  onBack,
  onRefresh,
  isRefreshing,
}: Props) {
  return (
    <Card className="rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">
            {p?.name ?? (p ? `Produto #${p.id}` : "Produto")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {p?.brand_name ? (
              <span className="mr-2">
                Marca: <span className="font-medium">{p.brand_name}</span>
              </span>
            ) : null}
            {p?.category_name ? (
              <span>
                Categoria:{" "}
                <span className="font-medium">{p.category_name}</span>
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {p?.gtin ? <Badge variant="outline">GTIN {p.gtin}</Badge> : null}
            {p?.partnumber ? (
              <Badge variant="secondary">MPN {p.partnumber}</Badge>
            ) : null}
            {p?.id_ecommerce ? (
              <Badge variant="outline">E-commerce #{p.id_ecommerce}</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button onClick={onRefresh} className="gap-2">
            <RefreshCw
              className={cx("h-4 w-4", isRefreshing && "animate-spin")}
            />{" "}
            Refresh
          </Button>
        </div>
      </div>
    </Card>
  );
}
