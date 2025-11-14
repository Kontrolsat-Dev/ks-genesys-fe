import { Badge } from "@/components/ui/badge";

type Props = {
  name?: string;
  active?: boolean;
};

export default function SupplierHeader({ name, active }: Props) {
  const isActive = !!active;
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">
          {name ? `Editar fornecedor: ${name}` : "Editar fornecedor"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Fornecedor • Feed • Mapper
        </p>
      </div>

      <Badge variant={isActive ? "secondary" : "outline"}>
        {isActive ? "Ativo" : "Inativo"}
      </Badge>
    </div>
  );
}
