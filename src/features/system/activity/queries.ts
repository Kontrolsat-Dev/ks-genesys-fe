// src/features/system/activity/queries.ts
// React Query hooks para audit logs

import { useQuery } from "@tanstack/react-query";
import { auditClient } from "@/api/audit";
import type { AuditLogListParams, AuditLogListResponse } from "@/api/audit";

const AUDIT_ROOT = ["audit"] as const;

export const auditKeys = {
  root: AUDIT_ROOT,
  list: (params: AuditLogListParams) => [...AUDIT_ROOT, "list", params] as const,
  eventTypes: [...AUDIT_ROOT, "event-types"] as const,
};

export function useAuditLogs(params: AuditLogListParams = {}) {
  return useQuery<AuditLogListResponse & { elapsedMs?: number }>({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      const t0 = performance.now();
      const res = await auditClient.list(params);
      const elapsedMs = performance.now() - t0;
      return { ...res, elapsedMs };
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useEventTypes() {
  return useQuery({
    queryKey: auditKeys.eventTypes,
    queryFn: () => auditClient.getEventTypes(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
