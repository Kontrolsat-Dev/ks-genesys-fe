// src/features/system/config/index.tsx
import { useConfigList, useUpdateConfig, useSeedConfig } from "./queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, Loader2, Settings } from "lucide-react";
import { ConfigCategoryCard } from "./components/config-category-card";
import { toast } from "sonner";

export default function ConfigPage() {
    const { data, isLoading, isError, refetch, isFetching } = useConfigList();
    const updateMutation = useUpdateConfig();
    const seedMutation = useSeedConfig();

    const handleUpdate = async (key: string, value: string) => {
        try {
            await updateMutation.mutateAsync({ key, data: { value } });
            toast.success(`Configuração "${key}" atualizada`);
        } catch (error) {
            toast.error(`Erro ao atualizar "${key}"`);
            throw error;
        }
    };

    const handleSeed = async () => {
        try {
            const result = await seedMutation.mutateAsync();
            toast.success(result.message);
        } catch {
            toast.error("Erro ao restaurar configurações de fábrica");
        }
    };

    const totalConfigs = data?.total ?? 0;

    return (
        <div className="mx-auto space-y-6">
            {/* Header */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Configurações de Plataforma
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {totalConfigs} configurações disponíveis
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSeed}
                            disabled={seedMutation.isPending}
                            className="gap-2 h-9"
                        >
                            {seedMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RotateCcw className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Restaurar Fábrica</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="gap-2 h-9"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">
                                {isFetching ? "A atualizar..." : "Refresh"}
                            </span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Error State */}
            {isError && (
                <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Ocorreu um erro ao carregar as configurações. Tenta novamente.
                    </p>
                </Card>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Categories */}
            {data?.categories && (
                <div className="space-y-4">
                    {data.categories.map((group) => (
                        <ConfigCategoryCard
                            key={group.category}
                            category={group.category}
                            configs={group.configs}
                            onUpdate={handleUpdate}
                            isUpdating={updateMutation.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
