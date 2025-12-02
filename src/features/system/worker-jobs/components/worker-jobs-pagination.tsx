// src/features/system/worker-jobs/components/worker-jobs-pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type WorkerJobsPaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    isFetching?: boolean;
    onPrev: () => void;
    onNext: () => void;
};

export function WorkerJobsPagination({
    page,
    total,
    totalPages,
    isFetching,
    onPrev,
    onNext,
}: WorkerJobsPaginationProps) {
    if (total === 0) return null;

    return (
        <div className="border-t bg-muted/30">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left: Results info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                        {total > 0 ? (
                            <>
                                <span className="font-medium text-foreground">
                                    {total.toLocaleString()}
                                </span>{" "}
                                {total === 1 ? "job" : "jobs"}
                            </>
                        ) : (
                            "Nenhum resultado"
                        )}
                    </span>
                    {isFetching && (
                        <>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                a atualizar
                            </span>
                        </>
                    )}
                </div>

                {/* Right: Pagination controls */}
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                        Página{" "}
                        <span className="font-medium text-foreground">
                            {page}
                        </span>{" "}
                        de{" "}
                        <span className="font-medium text-foreground">
                            {totalPages}
                        </span>
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPrev}
                            disabled={page <= 1 || isFetching}
                            className="h-8 px-2.5 gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Anterior</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onNext}
                            disabled={page >= totalPages || isFetching}
                            className="h-8 px-2.5 gap-1"
                        >
                            <span className="hidden sm:inline">Seguinte</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
