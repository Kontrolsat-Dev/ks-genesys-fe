// src/features/system/worker-jobs/index.tsx
import { useState } from "react";
import { useWorkerJobsList } from "./queries";
import type { WorkerJobStatus } from "@/api/worker-jobs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Componentes extraídos
import { WorkerJobsFilters } from "./components/worker-jobs-filters";
import { WorkerJobsTable } from "./components/worker-jobs-table";
import { WorkerJobsPagination } from "./components/worker-jobs-pagination";

type StatusFilterValue = WorkerJobStatus | "all";

const PAGE_SIZE = 20;

export default function WorkerJobsPage() {
    const [jobKind, setJobKind] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
    const [page, setPage] = useState<number>(1);

    const { data, isLoading, isError, refetch, isFetching } = useWorkerJobsList({
        job_kind: jobKind.trim() ? jobKind.trim() : null,
        status: statusFilter === "all" ? null : statusFilter,
        page,
        page_size: PAGE_SIZE,
    });

    const total = data?.total ?? 0;
    const pageSize = data?.page_size ?? PAGE_SIZE;
    const currentPage = data?.page ?? page;
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

    const handleNext = () => {
        if (currentPage < totalPages) {
            setPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setPage(currentPage - 1);
        }
    };

    const handleStatusChange = (value: string) => {
        const v = value as StatusFilterValue;
        setStatusFilter(v);
        setPage(1);
    };

    const handleJobKindChange = (value: string) => {
        setJobKind(value);
        setPage(1);
    };

    const hasActiveFilters = jobKind.trim() !== "" || statusFilter !== "all";

    return (
        <div className="mx-auto space-y-6">
            {/* Header */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight">Worker Jobs</h1>
                        <p className="text-sm text-muted-foreground">
                            Monitoriza e pesquisa jobs do sistema de processamento assíncrono.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <WorkerJobsFilters
                            jobKind={jobKind}
                            onJobKindChange={handleJobKindChange}
                            status={statusFilter}
                            onStatusChange={handleStatusChange}
                            hasActiveFilters={hasActiveFilters}
                            onClearFilters={() => {
                                setJobKind("");
                                setStatusFilter("all");
                            }}
                        />

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

            {/* Tabela */}
            <Card className="overflow-hidden p-0">
                {isError && (
                    <div className="px-6 py-4 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            Ocorreu um erro ao carregar os jobs. Tenta novamente.
                        </p>
                    </div>
                )}

                <div className="min-w-full overflow-x-auto">
                    <WorkerJobsTable
                        items={data?.items ?? []}
                        loading={isLoading && !data}
                    />
                </div>

                <WorkerJobsPagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={total}
                    totalPages={totalPages}
                    isFetching={isFetching}
                    onPrev={handlePrev}
                    onNext={handleNext}
                />
            </Card>
        </div>
    );
}
