// src/api/runs/index.ts
import { RunsService } from "./service";

export const runsClient = new RunsService();

export * from "./types";
