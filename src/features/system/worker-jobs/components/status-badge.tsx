// src/features/system/worker-jobs/components/status-badge.tsx
import type { WorkerJobStatus } from "@/api/worker-jobs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
    status: WorkerJobStatus;
};

const statusConfig: Record<
    WorkerJobStatus,
    { label: string; className: string }
> = {
    pending: {
        label: "PENDING",
        className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    },
    running: {
        label: "RUNNING",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    },
    done: {
        label: "DONE",
        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
    },
    failed: {
        label: "FAILED",
        className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    },
    cancelled: {
        label: "CANCELLED",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
    },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge
            variant="outline"
            className={cn(
                "text-[10px] px-2 py-0.5 font-semibold border-none",
                config.className,
            )}
        >
            {config.label}
        </Badge>
    );
}
