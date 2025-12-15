import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Upload } from "lucide-react";
import type { ProductOut } from "@/api/products/types";
import { cx } from "@/lib/utils";
import { CopyBadge } from "@/components/genesys-ui/copy-badge";

type Props = {
  product?: ProductOut;
  onBack: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onImport?: () => void;
  isImported?: boolean;
};

export default function ProductHeader({
  product: p,
  onBack,
  onRefresh,
  isRefreshing,
  onImport,
  isImported,
}: Props) {
  return (
    <div className="space-y-1">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {p?.name ?? (p ? `Produto #${p.id}` : "Produto")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {p?.brand_name ? (
              <span className="mr-3 inline-block">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Marca:
                </span>
                <span className="ml-1 font-semibold text-foreground">
                  {p.brand_name}
                </span>
              </span>
            ) : null}
            {p?.category_name ? (
              <span className="inline-block">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Categoria:
                </span>
                <span className="ml-1 font-semibold text-foreground">
                  {p.category_name}
                </span>
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex h-full items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button
            onClick={onRefresh}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw
              className={cx("h-4 w-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
          {onImport && (
            <Button
              onClick={onImport}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isImported}
            >
              <Upload className="h-4 w-4" />
              {isImported ? "Importado" : "Importar"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-3">
        {p?.gtin && (
          <CopyBadge label="GTIN" value={p.gtin} variant="secondary" />
        )}
        {p?.partnumber && (
          <CopyBadge
            label="MPN"
            value={String(p.partnumber)}
            variant="secondary"
          />
        )}
        {p?.id_ecommerce ? (
          <Badge variant="secondary">E-commerce #{p.id_ecommerce}</Badge>
        ) : null}
      </div>
    </div>
  );
}
