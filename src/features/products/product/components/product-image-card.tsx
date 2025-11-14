import { Card } from "@/components/ui/card";
import type { ProductOut } from "@/api/products/types";
import { fmtDate } from "./product-utils";

type Props = { product?: ProductOut };

function KV({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border p-2 rounded hover:bg-accent transitio duration-200">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "text-sm font-mono" : "text-sm"}>
        {value || "—"}
      </div>
    </div>
  );
}

export default function ProductImageCard({ product: p }: Props) {
  return (
    <Card className="p-6 space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted/40 flex items-center justify-center">
        {p?.image_url ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={p.image_url}
            alt={p?.name ?? "product"}
            className="h-full max-h-[360px] w-auto object-contain"
          />
        ) : (
          <div className="text-xs text-muted-foreground">Sem imagem</div>
        )}
      </div>

      <div className="grid grid-cols-4 text-center gap-4 text-sm">
        <KV label="Criado" value={fmtDate(p?.created_at)} />
        <KV label="Atualizado" value={fmtDate(p?.updated_at)} />
        <KV label="Peso" value={p?.weight_str || "—"} />
        <KV label="Categoria" value={p?.category_name || "—"} />
      </div>
    </Card>
  );
}
