// src/features/system/config/components/config-category-card.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { PlatformConfig } from "@/api/config";
import { ConfigItem } from "./config-item";

interface ConfigCategoryCardProps {
    category: string;
    configs: PlatformConfig[];
    onUpdate: (key: string, value: string) => Promise<void>;
    isUpdating: boolean;
}

const categoryLabels: Record<string, string> = {
    prices: "Preços",
    workers: "Workers",
    sync: "Sincronização",
    general: "Geral",
};

const categoryDescriptions: Record<string, string> = {
    prices: "Taxa de IVA e configurações de arredondamento de preços",
    workers: "Timeouts, intervalos e limites de batch para jobs",
    sync: "Prioridades de eventos de sincronização",
    general: "Configurações gerais do sistema",
};

export function ConfigCategoryCard({
    category,
    configs,
    onUpdate,
    isUpdating,
}: ConfigCategoryCardProps) {
    const [expanded, setExpanded] = useState(true);

    const label = categoryLabels[category] ?? category;
    const description = categoryDescriptions[category] ?? "";

    return (
        <Card>
            <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            {expanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            {label}
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {configs.length}
                            </span>
                        </CardTitle>
                        {description && (
                            <p className="text-sm text-muted-foreground ml-6">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="pt-0">
                    <div className="space-y-3">
                        {configs.map((config) => (
                            <ConfigItem
                                key={config.key}
                                config={config}
                                onUpdate={onUpdate}
                                isUpdating={isUpdating}
                            />
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
