import {CatalogUpdateStreamService} from "@/api/catalog-update-stream/service.ts";

export const catalogUpdateStreamClient = new CatalogUpdateStreamService(/* http */);

export * from "./types"