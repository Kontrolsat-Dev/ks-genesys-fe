// src/features/system/worker-jobs/components/worker-jobs-filters.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import type { WorkerJobStatus } from "@/api/worker-jobs";
import { X, XCircle } from "lucide-react";

type StatusFilterValue = WorkerJobStatus | "all";

type WorkerJobsFiltersProps = {
    jobKind: string;
    onJobKindChange: (value: string) => void;
    status: StatusFilterValue;
    onStatusChange: (value: string) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
};

export function WorkerJobsFilters({
    jobKind,
    onJobKindChange,
    status,
    onStatusChange,
    hasActiveFilters,
    onClearFilters,
}: WorkerJobsFiltersProps) {
    return (
        <>
            {/* Job Kind Input */}
            <div className="relative w-[260px]">
                <Input
                    value={jobKind}
                    onChange={(e) => onJobKindChange(e.target.value)}
                    placeholder="Pesquisar por job kind…"
                    className="pr-7"
                />
                {jobKind && (
                    <button
                        type="button"
                        onClick={() => onJobKindChange("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        aria-label="Limpar job kind"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Status Select */}
            <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-9"
                    onClick={onClearFilters}
                >
                    <XCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpar</span>
                </Button>
            )}
        </>
    );
}
