import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Phone,
    Mail,
    CreditCard,
    Truck,
    Package,
    AlertCircle,
    MapPin,
    FileText
} from "lucide-react";
import { usePrestashopOrder } from "../queries";
import { fmtPrice } from "@/helpers/fmtPrices";
import { Button } from "@/components/ui/button";

interface PrestaOrderModalProps {
    idPsOrder: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PrestaOrderModal({
    idPsOrder,
    open,
    onOpenChange,
}: PrestaOrderModalProps) {
    const { data: order, isLoading, error } = usePrestashopOrder(
        open ? idPsOrder : null
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 flex flex-col gap-0 overflow-hidden sm:rounded-xl min-w-[900px] max-w-[95vw] h-[85vh]">
                {/* Header Strip - Always Visible */}
                <div className="px-6 py-4 pr-12 border-b bg-muted/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold font-mono tracking-tight">#{idPsOrder}</DialogTitle>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {order ? order.reference : "..."}
                                {order?.date_add && <span>• {new Date(order.date_add).toLocaleDateString()}</span>}
                            </div>
                        </div>
                    </div>

                    {order && (
                        <div className="flex items-center gap-4 self-end sm:self-auto">
                            <div className="text-right hidden sm:block">
                                <span className="text-xs font-medium text-muted-foreground uppercase block">Total</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{fmtPrice(order.total)}</span>
                            </div>
                            <Badge
                                style={{
                                    backgroundColor: order.status.color,
                                    borderColor: order.status.color,
                                    color: "#fff",
                                }}
                                className="text-sm px-3 py-1 shadow-sm"
                            >
                                {order.status.name}
                            </Badge>
                        </div>
                    )}
                </div>

                <ScrollArea className="flex-1 w-full bg-white dark:bg-zinc-950 min-h-0">
                    {/* Loading State */}
                    {isLoading && !order && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                            <p>A carregar informaçao...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="h-full flex flex-col items-center justify-center text-destructive p-8">
                            <AlertCircle className="h-10 w-10 mb-4" />
                            <p className="font-medium">Erro ao carregar encomenda</p>
                            <p className="text-sm opacity-80">{(error as Error).message}</p>
                        </div>
                    )}

                    {/* Content */}
                    {order && (
                        <div className="p-6 sm:p-8 pb-10 space-y-8">

                            {/* Customer & Addresses Section */}
                            <div className="flex flex-col gap-6">
                                {/* Customer Header Card */}
                                <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-muted/10 items-start sm:items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg select-none">
                                            {order.customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg leading-none mb-1">{order.customer.name}</div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1.5 select-all">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <a href={`mailto:${order.customer.email}`} className="hover:text-primary transition-colors">{order.customer.email}</a>
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-70">
                                                    <span>Ref. Cliente: {order.customer.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {(order.delivery.phone || order.delivery.mobile) && (
                                        <div className="flex flex-col sm:items-end gap-1 text-sm">
                                            {order.delivery.phone && (
                                                <div className="flex items-center gap-2 font-medium bg-white dark:bg-black border px-2 py-1 rounded-md shadow-sm select-all">
                                                    <Phone className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                                                    {order.delivery.phone}
                                                </div>
                                            )}
                                            {order.delivery.mobile && (
                                                <div className="flex items-center gap-2 font-medium bg-white dark:bg-black border px-2 py-1 rounded-md shadow-sm select-all">
                                                    <Phone className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                                                    {order.delivery.mobile}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Addresses & Logistics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Delivery Address */}
                                    <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5" /> Morada de Entrega
                                        </h3>
                                        <div className="text-sm leading-relaxed">
                                            <div className="font-medium">{order.delivery.name}</div>
                                            {order.delivery.company && <div className="text-muted-foreground">{order.delivery.company}</div>}
                                            <div className="mt-1">
                                                <div className="select-text">{order.delivery.address1}</div>
                                                {order.delivery.address2 && <div className="select-text">{order.delivery.address2}</div>}
                                                <div className="select-text">{order.delivery.postal_code} {order.delivery.city}</div>
                                                {order.delivery.country && <div className="font-medium mt-1">{order.delivery.country.name}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Address */}
                                    <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5" /> Morada de Faturação
                                        </h3>
                                        <div className="text-sm leading-relaxed">
                                            <div className="font-medium">{order.invoice.name}</div>
                                            {order.invoice.company && <div className="text-muted-foreground">{order.invoice.company}</div>}
                                            {order.invoice.vat_number && <div className="text-xs font-mono bg-muted/50 inline-block px-1 rounded mt-0.5 select-all">NIF: {order.invoice.vat_number}</div>}

                                            <div className="mt-2 opacity-80">
                                                <div className="select-text">{order.invoice.address1}</div>
                                                {order.invoice.address2 && <div className="select-text">{order.invoice.address2}</div>}
                                                <div className="select-text">{order.invoice.postal_code} {order.invoice.city}</div>
                                                {order.invoice.country && <div>{order.invoice.country.name}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logistics & Payment */}
                                    <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Package className="h-3.5 w-3.5" /> Logística & Pagamento
                                        </h3>
                                        <div className="space-y-4 text-sm">
                                            <div>
                                                <div className="text-muted-foreground text-xs mb-1">Método de Envio</div>
                                                <div className="font-medium flex items-center gap-2 bg-muted/20 p-2 rounded border border-dashed text-xs">
                                                    <Truck className="h-3.5 w-3.5 text-blue-500" />
                                                    {order.shipping?.carrier || "N/A"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs mb-1">Pagamento</div>
                                                <div className="font-medium flex items-center gap-2 bg-muted/20 p-2 rounded border border-dashed text-xs">
                                                    <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                                                    {order.payment}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Products Table - Clean Layout */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    Itens
                                    <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-xs font-normal">
                                        {order.products.length}
                                    </Badge>
                                </h3>

                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-[50%] pl-4">Produto</TableHead>
                                                <TableHead className="text-center w-[15%]">Stock Loja</TableHead>
                                                <TableHead className="text-center w-[10%]">Qtd</TableHead>
                                                <TableHead className="text-right w-[15%]">Preço</TableHead>
                                                <TableHead className="text-right w-[10%] pr-4">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.products.map((prod, idx) => {
                                                const upc = Number(prod.product_upc || 0);
                                                const hasPhysicalStock = upc > 0;

                                                return (
                                                    <TableRow key={`${prod.product_id}-${idx}`} className="group hover:bg-muted/20 border-b-muted/40">
                                                        <TableCell className="pl-4 py-3 align-top">
                                                            <div className="flex gap-4">
                                                                <div className="h-12 w-12 rounded border bg-white p-1 flex-shrink-0">
                                                                    {prod.product_image ? (
                                                                        <img src={prod.product_image} alt="" className="h-full w-full object-contain" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                                                            <Package className="h-6 w-6" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
                                                                        {prod.product_name}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <span className="bg-muted px-1.5 rounded border font-mono text-[10px]">{prod.product_reference}</span>
                                                                        {prod.product_ean13 && <span>EAN: {prod.product_ean13}</span>}
                                                                    </div>
                                                                    {prod.services && prod.services.length > 0 && (
                                                                        <div className="pt-1 space-y-0.5">
                                                                            {prod.services.map(svc => (
                                                                                <div key={svc.cart_service_id} className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                                                    <span className="w-1 h-1 bg-current rounded-full" />
                                                                                    {svc.name} (+{fmtPrice(svc.cost)})
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center align-top py-3">
                                                            {hasPhysicalStock ? (
                                                                <Badge variant="outline" className="text-[10px] font-normal border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-900/10">
                                                                    Sim (UPC:{upc})
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground/30 text-xs">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center align-top py-3 tabular-nums text-sm">
                                                            {prod.product_quantity}
                                                        </TableCell>
                                                        <TableCell className="text-right align-top py-3 tabular-nums text-sm text-muted-foreground">
                                                            {fmtPrice(prod.product_price)}
                                                        </TableCell>
                                                        <TableCell className="text-right align-top py-3 tabular-nums font-medium text-sm pr-4">
                                                            {fmtPrice(Number(prod.product_price) * Number(prod.product_quantity))}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Bottom Section */}
                            <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
                                {/* Notes */}
                                {order.notes && (
                                    <div className="w-full md:w-1/2">
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 text-sm">
                                            <div className="font-semibold text-amber-800 dark:text-amber-200 mb-2 text-xs uppercase tracking-wide">Notas da Encomenda</div>
                                            <p className="text-amber-900 dark:text-amber-100 italic">{order.notes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Totals Summary */}
                                <div className="w-full space-y-3 bg-muted/5 p-4 rounded-lg border">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{fmtPrice(order.total_products)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Envio</span>
                                        <span>{fmtPrice(order.shipping?.price || 0)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Descontos</span>
                                            <span className="text-muted-foreground">- {fmtPrice(order.discount || 0)}</span>
                                        </div>
                                    )}

                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-end">
                                        <span className="font-semibold">Total</span>
                                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                            {fmtPrice(order.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </ScrollArea>

                {/* Footer Actions if needed */}
                <div className="p-4 border-t bg-muted/5 flex justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
