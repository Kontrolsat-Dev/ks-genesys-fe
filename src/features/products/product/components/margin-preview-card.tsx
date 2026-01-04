// src/features/products/product/components/margin-preview-card.tsx
// Componente para preview e ajuste de margem na modal de importação

import { Slider } from "@/components/ui/slider";
import { Percent, ArrowRight } from "lucide-react";
import type { OfferOut } from "@/api/products/types";
import { fmtPrice } from "@/helpers/fmtPrices";
import { fmtMargin } from "@/helpers/fmtNumbers";
import { calculatePricePreview } from "@/helpers/priceRounding";

type Props = {
  currentMargin: number;
  margin: number;
  onMarginChange: (margin: number) => void;
  bestOffer: OfferOut | null;
};

export function MarginPreviewCard({
  currentMargin,
  margin,
  onMarginChange,
  bestOffer,
}: Props) {
  // Use best offer from backend (already calculated with discount)
  const cost = bestOffer?.price ? Number(bestOffer.price) : null;
  const hasChanged = Math.abs(margin - currentMargin * 100) > 0.1;

  // Calculate prices with rounding using centralized helper
  const pricePreview =
    cost !== null && Number.isFinite(cost)
      ? calculatePricePreview(cost, margin)
      : null;

  return (
    <div className="rounded-lg border bg-muted/30 p-5 space-y-5">
      {/* Margin cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Margem Atual
          </p>
          <p className="text-2xl font-semibold font-mono">
            {fmtMargin(currentMargin)}
          </p>
        </div>

        <div
          className={`rounded-lg border-2 p-4 transition-colors ${
            hasChanged
              ? "border-teal-500/50 bg-teal-50 dark:bg-teal-950/20"
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
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  Math.abs(margin - val) < 0.5
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

      {/* Price preview with rounding */}
      {bestOffer && cost !== null && Number.isFinite(cost) && pricePreview && (
        <div className="rounded-lg border bg-background p-4 space-y-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Preview de Preço (Melhor Oferta)
          </p>

          {/* Flow: Custo → Preço Bruto → +IVA → Arredondado */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">Custo</p>
              <p className="text-sm font-mono font-medium">{fmtPrice(cost)}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">+Margem</p>
              <p className="text-sm font-mono font-medium">
                {fmtPrice(pricePreview.priceWithMargin)}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">+23% IVA</p>
              <p className="text-sm font-mono font-medium text-muted-foreground line-through">
                {fmtPrice(pricePreview.rawPriceVat)}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground mb-1">Final c/IVA</p>
              <p className="text-lg font-mono font-bold text-teal-600 dark:text-teal-400">
                {fmtPrice(pricePreview.roundedVat)}
              </p>
            </div>
          </div>

          {/* Preço para PrestaShop */}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-xs text-muted-foreground">
              Preço s/IVA (PrestaShop):
            </span>
            <span className="font-mono font-semibold">
              {fmtPrice(pricePreview.finalPriceNoVat)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Fornecedor: {bestOffer.supplier_name ?? `#${bestOffer.id_supplier}`}
          </p>
        </div>
      )}
    </div>
  );
}
