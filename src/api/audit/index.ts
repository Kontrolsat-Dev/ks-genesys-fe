// src/api/audit/index.ts
import { AuditService } from "./service";

export const auditClient = new AuditService();

export * from "./types";
