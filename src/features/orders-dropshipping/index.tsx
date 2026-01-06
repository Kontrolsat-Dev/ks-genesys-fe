// src/features/orders-dropshipping/index.tsx
import { useState } from "react";
import {
    Package,
    RefreshCw,
    DownloadCloud,
    ExternalLink,
    Copy,
    Check,
    Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { usePendingLines, useImportOrders, useSelectSupplier } from "./queries";
import type {
    PendingLineWithOffers,
    SupplierOfferOut,
    OrderStatus,
} from "@/api/orders-dropshipping";
import { fmtMoney } from "@/helpers/fmtPrices";
import { PrestaOrderModal } from "./components/presta-order-modal";

const PS_ADMIN_URL = "https://www.kontrolsat.com/admin230/index.php";

// Genesys status config
const STATUS_STYLES: Record<OrderStatus, string> = {
    pending: "text-amber-600 dark:text-amber-400",
    ordered: "text-blue-600 dark:text-blue-400",
    shipped_store: "text-purple-600 dark:text-purple-400",
    completed: "text-emerald-600 dark:text-emerald-400",
    cancelled: "text-zinc-500",
    error: "text-red-600 dark:text-red-400",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: "Pendente",
    ordered: "Encomendada",
    shipped_store: "Enviado",
    completed: "Concluída",
    cancelled: "Cancelada",
    error: "Erro",
};

function CopyableText({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            /* ignore */
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
        >
            <span>{text}</span>
            {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
            ) : (
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            )}
        </button>
    );
}

function SupplierAvatar({
    offer,
    isBest,
    onClick,
}: {
    offer: SupplierOfferOut;
    isBest: boolean;
    onClick: () => void;
}) {
    const stockNum = offer.stock ?? 0;
    const noStock = stockNum <= 0;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={onClick}
                    className={cn(
                        "h-8 w-8 rounded-md border overflow-hidden transition-all",
                        isBest && "ring-2 ring-emerald-500 ring-offset-1 ring-offset-background",
                        noStock && "opacity-40 grayscale",
                        !isBest && !noStock && "hover:ring-1 hover:ring-border"
                    )}
                >
                    {offer.supplier_image ? (
                        <img
                            src={offer.supplier_image}
                            alt={offer.supplier_name ?? ""}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                            {(offer.supplier_name ?? "??").slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-48">
                <p className="font-medium">{offer.supplier_name}</p>
                <p className={cn(noStock && "text-destructive")}>
                    {noStock ? "Sem stock" : `${stockNum} un.`}
                </p>
                <p className="font-semibold">{fmtMoney(offer.price)}</p>
            </TooltipContent>
        </Tooltip>
    );
}

function LineRow({
    line,
    isSelected,
    onToggle,
    onViewOrder,
}: {
    line: PendingLineWithOffers;
    isSelected: boolean;
    onToggle: () => void;
    onViewOrder: (id: number) => void;
}) {
    const selectSupplier = useSelectSupplier();

    const handleSelect = async (offer: SupplierOfferOut) => {
        await selectSupplier.mutateAsync({
            orderId: line.id_order,
            lineId: line.id,
            payload: { id_supplier: offer.id_supplier, supplier_cost: offer.price },
        });
    };

    const psUrl = `${PS_ADMIN_URL}?controller=AdminOrders&vieworder=&id_order=${line.id_ps_order}`;
    const bestSupplier = line.offers[0]?.id_supplier;

    return (
        <tr className={cn("border-b border-border/50 hover:bg-muted/40 transition-colors", isSelected && "bg-muted/60")}>
            <td className="pl-4 pr-2 py-3 w-10">
                <Checkbox checked={isSelected} onCheckedChange={onToggle} />
            </td>

            {/* Order */}
            <td className="px-3 py-3 w-44">
                <div className="flex items-center gap-2">
                    <a
                        href={psUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm font-medium hover:underline"
                    >
                        {line.order_reference}
                    </a>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onViewOrder(line.id_ps_order)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Ver detalhes JIT"
                        >
                            <Eye className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                        <a
                            href={psUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Ver no Backoffice PS"
                        >
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </a>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">{line.customer_name}</p>
            </td>

            {/* Genesys Status */}
            <td className="px-3 py-3 w-24">
                <span className={cn("text-xs font-medium", STATUS_STYLES[line.status])}>
                    {STATUS_LABELS[line.status]}
                </span>
            </td>

            {/* Product */}
            <td className="px-3 py-3">
                <p className="text-sm font-medium truncate max-w-xs">{line.product_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                    {line.product_ean && <CopyableText text={line.product_ean} />}
                    {line.product_reference && <CopyableText text={line.product_reference} />}
                </div>
            </td>

            {/* Qty */}
            <td className="px-3 py-3 w-16 text-center">
                <span className="text-sm tabular-nums">{line.qty}</span>
            </td>

            {/* Price */}
            <td className="px-3 py-3 w-24 text-right">
                <span className="text-sm tabular-nums font-medium">{fmtMoney(line.unit_price_tax_incl)}</span>
            </td>

            {/* Offers */}
            <td className="px-3 py-3">
                {line.offers.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                        {line.offers.map((o) => (
                            <SupplierAvatar
                                key={o.id_supplier}
                                offer={o}
                                isBest={o.id_supplier === bestSupplier}
                                onClick={() => handleSelect(o)}
                            />
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </td>

            {/* Product link */}
            <td className="pr-4 pl-2 py-3 w-10">
                {line.id_product && (
                    <a
                        href={`/products/${line.id_product}`}
                        target="_blank"
                        rel="noopener"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Package className="h-4 w-4" />
                    </a>
                )}
            </td>
        </tr>
    );
}

export default function OrdersDropshippingPage() {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewPsOrderId, setViewPsOrderId] = useState<number | null>(null);

    const { data, isLoading, isFetching, refetch } = usePendingLines(
        statusFilter === "all" ? null : statusFilter
    );
    const importMut = useImportOrders();

    const lines = data?.items ?? [];
    const total = data?.total ?? 0;
    const selCount = selectedIds.size;

    const toggle = (id: number) =>
        setSelectedIds((s) => {
            const n = new Set(s);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });

    const toggleAll = () =>
        setSelectedIds(selCount === lines.length ? new Set() : new Set(lines.map((l) => l.id)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">Linhas Dropshipping</h1>
                    <p className="text-sm text-muted-foreground">
                        {total} {total === 1 ? "linha" : "linhas"}
                        {selCount > 0 && <> · {selCount} selecionada{selCount > 1 && "s"}</>}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="ordered">Encomendada</SelectItem>
                            <SelectItem value="shipped_store">Enviado</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" className="h-8" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
                    </Button>

                    <Button
                        size="sm"
                        className="h-8"
                        onClick={() =>
                            importMut.mutate(null, {
                                onSuccess: (data) =>
                                    toast.success(
                                        `Importação concluída: ${data.imported} importadas, ${data.skipped} existentes.`
                                    ),
                                onError: (err) => toast.error(`Erro ao importar: ${err.message}`),
                            })
                        }
                        disabled={importMut.isPending}
                    >
                        <DownloadCloud className="h-3.5 w-3.5 mr-1.5" />
                        Importar
                    </Button>
                </div>
            </header>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : lines.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground text-sm">Sem linhas</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="text-xs text-muted-foreground border-b border-border bg-muted/50">
                            <tr>
                                <th className="pl-4 pr-2 py-2.5 w-10">
                                    <Checkbox
                                        checked={selCount === lines.length && lines.length > 0}
                                        onCheckedChange={toggleAll}
                                    />
                                </th>
                                <th className="px-3 py-2.5 font-medium">Encomenda</th>
                                <th className="px-3 py-2.5 font-medium">Estado</th>
                                <th className="px-3 py-2.5 font-medium">Produto</th>
                                <th className="px-3 py-2.5 font-medium text-center">Qtd</th>
                                <th className="px-3 py-2.5 font-medium text-right">Preço</th>
                                <th className="px-3 py-2.5 font-medium">Ofertas</th>
                                <th className="pr-4 pl-2 py-2.5 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((l) => (
                                <LineRow
                                    key={l.id}
                                    line={l}
                                    isSelected={selectedIds.has(l.id)}
                                    onToggle={() => toggle(l.id)}
                                    onViewOrder={setViewPsOrderId}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Floating bar */}
            {selCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
                        <span className="text-sm text-muted-foreground">{selCount} selecionada{selCount > 1 && "s"}</span>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                            Limpar
                        </Button>
                        <Button size="sm">Criar Pedido</Button>
                    </div>
                </div>
            )}

            <PrestaOrderModal
                idPsOrder={viewPsOrderId}
                open={!!viewPsOrderId}
                onOpenChange={(v) => !v && setViewPsOrderId(null)}
            />
        </div>
    );
}
