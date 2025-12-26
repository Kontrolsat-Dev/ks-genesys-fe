// src/api/audit/service.ts
// Serviço de API para audit logs

import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type {
  AuditLogOut,
  AuditLogListResponse,
  AuditLogListParams,
  EventTypesResponse,
} from "./types";

export class AuditService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  list(params: AuditLogListParams = {}) {
    return this.http.get<AuditLogListResponse>(Endpoints.AUDIT, {
      params: {
        event_type: params.event_type,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        from_date: params.from_date,
        to_date: params.to_date,
        page: params.page ?? 1,
        page_size: params.page_size ?? 50,
      },
    });
  }

  getById(id: number) {
    return this.http.get<AuditLogOut>(Endpoints.AUDIT_BY_ID(id));
  }

  getEventTypes() {
    return this.http.get<EventTypesResponse>(Endpoints.AUDIT_EVENT_TYPES);
  }
}

export type {
  AuditLogOut,
  AuditLogListResponse,
  AuditLogListParams,
  EventTypesResponse,
};
