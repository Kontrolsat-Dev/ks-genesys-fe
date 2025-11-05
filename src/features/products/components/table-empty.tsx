import { TableRow, TableCell } from "@/components/ui/table";
import { Link } from "react-router-dom";

export default function TableEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="py-16">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <p className="text-sm text-muted-foreground">
            Sem resultados. Ajuste os filtros ou{" "}
            <Link className="underline" to="/suppliers/create">
              crie um fornecedor
            </Link>{" "}
            para começar a importar.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
