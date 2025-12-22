// src/features/products/product/components/margin-preview-card.tsx
// Componente para preview e ajuste de margem na modal de importação

import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Percent } from "lucide-react";
import type { OfferOut } from "@/api/products/types";
import { fmtPrice } from "@/helpers/fmtPrices";

type Props = {
    currentMargin: number;
    margin: number;
    onMarginChange: (margin: number) => void;
    offers: OfferOut[];
};

export function MarginPreviewCard({
    currentMargin,
    margin,
    onMarginChange,
    offers,
}: Props) {
    // Find best offer (lowest price)
    const bestOffer = useMemo(() => {
        if (!offers || offers.length === 0) return null;
        return offers.reduce((best, offer) => {
            const bestPrice = best.price ? Number(best.price) : Infinity;
            const offerPrice = offer.price ? Number(offer.price) : Infinity;
            return offerPrice < bestPrice ? offer : best;
        }, offers[0]);
    }, [offers]);

    const cost = bestOffer?.price ? Number(bestOffer.price) : null;
    const hasChanged = Math.abs(margin - currentMargin * 100) > 0.1;

    // Calculate final price with margin
    const finalPrice = useMemo(() => {
        if (cost === null || !Number.isFinite(cost)) return null;
        return cost * (1 + margin / 100);
    }, [cost, margin]);

    return (
        <div className="rounded-lg border bg-muted/30 p-5 space-y-5">
            {/* Margin cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Margem Atual
                    </p>
                    <p className="text-2xl font-semibold font-mono">
                        {(currentMargin * 100).toFixed(0)}%
                    </p>
                </div>

                <div
                    className={`rounded-lg border-2 p-4 transition-colors ${hasChanged
                            ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20"
                            : "border-border bg-background"
                        }`}
                >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Nova Margem
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={margin.toFixed(0)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (Number.isFinite(val)) {
                                    onMarginChange(Math.max(0, Math.min(100, val)));
                                }
                            }}
                            className="w-16 text-2xl font-semibold font-mono bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Percent className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* Slider */}
            <div className="space-y-3">
                <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[margin]}
                    onValueChange={(v) => onMarginChange(Array.isArray(v) ? v[0] : 0)}
                    className="w-full"
                />

                {/* Quick presets */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {[10, 15, 20, 25, 30].map((val) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => onMarginChange(val)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${Math.abs(margin - val) < 0.5
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
                                    }`}
                            >
                                {val}%
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price preview */}
            {bestOffer && cost !== null && Number.isFinite(cost) && (
                <div className="rounded-lg border bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Preview de Preço (Melhor Oferta)
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Custo</p>
                            <p className="text-lg font-mono font-medium">{fmtPrice(cost)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Multiplicador</p>
                            <p className="text-lg font-mono font-medium">×{(1 + margin / 100).toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Preço Venda</p>
                            <p className="text-lg font-mono font-semibold text-emerald-600">
                                {finalPrice !== null ? fmtPrice(finalPrice) : "—"}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                        Fornecedor: {bestOffer.supplier_name ?? `#${bestOffer.id_supplier}`}
                    </p>
                </div>
            )}
        </div>
    );
}
