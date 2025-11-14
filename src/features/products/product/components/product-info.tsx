import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { ProductOut } from "@/api/products/types";
import ExpandableText from "./expandable-text";

type Props = {
  product?: ProductOut;
  metaSlot?: React.ReactNode;
  offersSlot?: React.ReactNode;
};

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
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "text-sm font-mono" : "text-sm"}>
        {value || "—"}
      </div>
    </div>
  );
}

export default function ProductInfo({
  product: p,
  metaSlot,
  offersSlot,
}: Props) {
  return (
    <Card className="p-6 space-y-4">
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informação</TabsTrigger>
          <TabsTrigger value="meta">Meta</TabsTrigger>
          <TabsTrigger value="ofertas">Ofertas</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <KV label="GTIN" value={p?.gtin || "—"} mono />
            <KV label="MPN" value={p?.partnumber || "—"} mono />
            <KV label="Marca" value={p?.brand_name || "—"} />
            <KV label="Categoria" value={p?.category_name || "—"} />
            <KV label="Peso" value={p?.weight_str || "—"} />
            <KV
              label="ID E-commerce"
              value={p?.id_ecommerce ? String(p.id_ecommerce) : "—"}
              mono
            />
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Descrição</h3>
            <ExpandableText text={p?.description} collapsedLines={2} />
          </div>
        </TabsContent>

        <TabsContent value="meta" className="pt-4">
          {metaSlot}
        </TabsContent>
        <TabsContent value="ofertas" className="pt-4">
          {offersSlot}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
