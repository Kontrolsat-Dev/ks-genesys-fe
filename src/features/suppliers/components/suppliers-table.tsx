// src/features/suppliers/components/suppliers-table.tsx
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Highlight from "@/components/genesys-ui/Hightlight";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtMargin } from "@/helpers/fmtNumbers";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // ⟵ Toaster

type Supplier = {
  id: number;
  name: string;
  active: boolean;
  logo_image?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  margin: number;
  country?: string | null;
  created_at: string;
  ingest_enabled?: boolean;
};

type Props = {
  items?: Supplier[];
  isLoading?: boolean;
  emptyHref: string;
  searchQuery: string | null;
  SkeletonRows: React.ComponentType<{ rows?: number; cols?: number }>;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => Promise<void> | void; // ⟵ pode ser async
  deletingId?: number | null;
  onRunIngest?: (id: number, name: string) => void;
};

export default function SuppliersTable({
  items = [],
  isLoading = false,
  emptyHref,
  searchQuery,
  SkeletonRows,
  onEdit,
  onDelete,
  deletingId,
  onRunIngest,
}: Props) {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const hasItems = Array.isArray(items) && items.length > 0;

  async function handleDelete(s: Supplier) {
    setConfirmId(null);
    try {
      await Promise.resolve(onDelete?.(s.id));
      toast.success(`Fornecedor ${s.name} removido`);
    } catch (err: any) {
      const msg =
        (typeof err === "object" && err?.message) ||
        "Não foi possível remover. Tente novamente.";
      toast.error(`Falha ao remover ${s.name}`, { description: msg });
    }
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
        <TableRow>
          <TableHead className="w-[5%]">#</TableHead>
          <TableHead className="w-[27%]">Fornecedor</TableHead>
          <TableHead className="w-[10%]">Estado</TableHead>
          <TableHead className="w-[10%]">Update Cat.</TableHead>
          <TableHead className="w-[14%]">País</TableHead>
          <TableHead className="w-[12%] text-right">Margem</TableHead>
          <TableHead className="w-[20%]">Email</TableHead>
          <TableHead className="w-[2%]" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          <SkeletonRows rows={8} cols={8} />
        ) : !hasItems ? (
          <TableRow>
            <TableCell colSpan={8} className="py-16">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <p className="text-sm text-muted-foreground">
                  Sem resultados. Ajuste os filtros ou crie um novo fornecedor.
                </p>
                <Button asChild size="sm" className="mt-2">
                  <Link to={emptyHref}>Criar fornecedor</Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          items.map((s) => {
            const isDeleting = deletingId === s.id;
            return (
              <TableRow
                key={s.id}
                className="group cursor-default transition-colors hover:bg-muted/30"
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <span className="select-none text-muted-foreground/30">#</span>
                  {s.id.toString().padStart(3, "0")}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border bg-white">
                      {s.logo_image ? (
                        <AvatarImage src={s.logo_image} alt={s.name} />
                      ) : (
                        <AvatarFallback className="text-[10px] text-muted-foreground">
                          {(s.name || "?").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="min-w-0">
                      <div className="truncate font-medium leading-tight text-foreground/90">
                        <Highlight text={s.name} query={searchQuery} />
                      </div>
                      {(s.contact_name || s.contact_phone) && (
                        <div className="truncate text-xs text-muted-foreground">
                          {s.contact_name ?? "—"}
                          {s.contact_phone ? ` • ${s.contact_phone}` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <span
                      className={`relative flex h-2 w-2 rounded-full ${s.active ? "bg-emerald-500" : "bg-neutral-300"}`}
                    >
                      {s.active && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                    </span>
                    <span className={s.active ? "text-foreground" : "text-muted-foreground"}>
                      {s.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border",
                      s.ingest_enabled
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        s.ingest_enabled ? "bg-primary" : "bg-muted-foreground/40"
                      )}
                    />
                    {s.ingest_enabled ? "ON" : "OFF"}
                  </div>
                </TableCell>

                <TableCell>{s.country || "—"}</TableCell>

                <TableCell className="text-right tabular-nums">
                  {typeof s.margin === "number" ? fmtMargin(s.margin) : "—"}
                </TableCell>

                <TableCell>
                  {s.contact_email ? (
                    <a
                      className="hover:underline"
                      href={`mailto:${s.contact_email}`}
                    >
                      <span className="block max-w-[240px] truncate md:max-w-[320px]">
                        <Highlight text={s.contact_email} query={searchQuery} />
                      </span>
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Mais ações"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit?.(s.id)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      <AlertDialog
                        open={confirmId === s.id}
                        onOpenChange={(o) => !o && setConfirmId(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setConfirmId(s.id);
                            }}
                            className="gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remover fornecedor
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem a certeza que pretende remover “{s.name}”?
                              Esta ação é irreversível.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setConfirmId(null)}
                            >
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(s)}
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => onRunIngest?.(s.id, s.name)}
                        className="gap-2 font-medium"
                      >
                        <Play className="h-4 w-4" />
                        Executar Ingest
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
