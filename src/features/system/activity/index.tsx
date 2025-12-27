// src/features/system/activity/index.tsx
// Página de Activity Log

import { useSearchParams } from "react-router-dom";
import {
  Activity,
  Package,
  FolderOpen,
  Settings,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs, useEventTypes } from "./queries";
import { cn } from "@/lib/utils";
import { fmtTimeAgo } from "@/helpers/fmtDate";
import type { AuditLogOut } from "@/api/audit";

// Mapeamento de event types para ícones e cores
const eventConfig: Record<
  string,
  { icon: typeof Activity; color: string; label: string }
> = {
  product_import: {
    icon: Package,
    color: "text-blue-500 bg-blue-500/10",
    label: "Import",
  },
  product_import_bulk: {
    icon: Package,
    color: "text-blue-500 bg-blue-500/10",
    label: "Bulk Import",
  },
  category_mapping: {
    icon: FolderOpen,
    color: "text-purple-500 bg-purple-500/10",
    label: "Mapping",
  },
  price_change: {
    icon: RefreshCw,
    color: "text-amber-500 bg-amber-500/10",
    label: "Preço",
  },
  stock_change: {
    icon: RefreshCw,
    color: "text-orange-500 bg-orange-500/10",
    label: "Stock",
  },
  config_update: {
    icon: Settings,
    color: "text-slate-500 bg-slate-500/10",
    label: "Config",
  },
  user_login: {
    icon: User,
    color: "text-emerald-500 bg-emerald-500/10",
    label: "Login",
  },
};

function getEventConfig(type: string) {
  return (
    eventConfig[type] || {
      icon: Activity,
      color: "text-muted-foreground bg-muted",
      label: type,
    }
  );
}

function ActivityItem({ log }: { log: AuditLogOut }) {
  const config = getEventConfig(log.event_type);
  const Icon = config.icon;

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      {/* Ícone */}
      <div className={cn("p-2 rounded-lg shrink-0 h-fit", config.color)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">
              {log.description || config.label}
            </p>
            {log.actor_name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                por {log.actor_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" />
            {fmtTimeAgo(log.created_at)}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {config.label}
          </Badge>
          {log.entity_type && log.entity_id && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {log.entity_type} #{log.entity_id}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const eventType = searchParams.get("event_type") || undefined;

  const { data: typesData } = useEventTypes();
  const { data, isLoading, isFetching } = useAuditLogs({
    page,
    page_size: 20,
    event_type: eventType,
  });

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  };

  const setEventType = (val: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (val && val !== "all") {
      params.set("event_type", val);
    } else {
      params.delete("event_type");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Actividade</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico de ações do sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={eventType || "all"}
          onValueChange={(v) => setEventType(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os eventos</SelectItem>
            {typesData?.event_types.map((t) => (
              <SelectItem key={t} value={t}>
                {getEventConfig(t).label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} registos
            {data.elapsedMs && ` · ${data.elapsedMs.toFixed(0)}ms`}
          </span>
        )}
      </div>

      {/* Timeline */}
      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.items.length ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Sem registos de actividade</p>
          </div>
        ) : (
          <div className={cn(isFetching && "opacity-50 transition-opacity")}>
            {data.items.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
