// src/api/worker-jobs/index.ts
import { WorkerJobsService } from "./service";

export const workerJobsClient = new WorkerJobsService();

export * from "./types";
