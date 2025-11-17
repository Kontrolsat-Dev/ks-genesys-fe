import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { ProductOut } from "@/api/products/types";
import ExpandableText from "@/components/genesys-ui/expandable-text";

type Props = {
  product?: ProductOut;
  metaSlot?: React.ReactNode;
  offersSlot?: React.ReactNode;
};

function InfoField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <p
        className={`text-sm ${
          mono ? "font-mono" : "font-medium"
        } text-foreground`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default function ProductInfo({
  product: p,
  metaSlot,
  offersSlot,
}: Props) {
  return (
    <Card className="p-6 border border-border">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/40 p-1 rounded-lg">
          <TabsTrigger
            value="info"
            className="text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Informação
          </TabsTrigger>
          <TabsTrigger
            value="meta"
            className="text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Meta
          </TabsTrigger>
          <TabsTrigger
            value="ofertas"
            className="text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Ofertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="GTIN" value={p?.gtin || "—"} mono />
            <InfoField label="MPN" value={p?.partnumber || "—"} mono />
            <InfoField label="Marca" value={p?.brand_name || "—"} />
            <InfoField label="Categoria" value={p?.category_name || "—"} />
            <InfoField label="Peso" value={p?.weight_str || "—"} />
            <InfoField
              label="ID E-commerce"
              value={p?.id_ecommerce ? String(p.id_ecommerce) : "—"}
              mono
            />
          </div>

          <Separator className="my-2" />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Descrição</h3>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <ExpandableText text={p?.description} collapsedLines={3} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="meta" className="pt-0">
          {metaSlot}
        </TabsContent>

        <TabsContent value="ofertas" className="pt-0">
          {offersSlot}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
