// src/features/products/product/components/chart-expand-modal.tsx
// Modal para expandir gráficos com filtro de período

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1a", days: 365 },
  { label: "Tudo", days: null },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: (params: { filterDays: number | null }) => React.ReactNode;
};

export default function ChartExpandModal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
}: Props) {
  const [filterDays, setFilterDays] = useState<number | null>(90);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[calc(100vw-6rem)] !max-w-none h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            
            {/* Period filter */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {PERIODS.map(({ label, days }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs",
                    filterDays === days && "bg-background shadow-sm"
                  )}
                  onClick={() => setFilterDays(days)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          {children({ filterDays })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
