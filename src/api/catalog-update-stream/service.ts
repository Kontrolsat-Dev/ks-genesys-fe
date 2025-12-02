import {HttpClient} from "@/lib/http-client";
import {Endpoints} from "@/constants/endpoints.ts";
import {authStore} from "@/lib/auth-store.ts";
import type {
    CatalogUpdateStreamListParams,
    CatalogUpdateStreamListResponse
} from "@/api/catalog-update-stream/types.ts";

export class CatalogUpdateStreamService {
    private http: HttpClient;

    constructor(http?: HttpClient) {
        this.http =
            http ??
            new HttpClient({
                baseUrl: Endpoints.BASE_URL,
                token: () => authStore.get(),
            });
    }

    listCatalogUpdates(params: CatalogUpdateStreamListParams = {}) {
        const {status = undefined, page = 1, page_size = 20} = params;

        return this.http.get<CatalogUpdateStreamListResponse>(
            Endpoints.CATALOG_UPDATE_STREAM,
            {
                params: {
                    status,
                    page,
                    page_size,
                },
            }
        );
    }

    // DLQ: só eventos com erro (status = failed)
    listCatalogUpdateErrors(page = 1, page_size = 20) {
        return this.http.get<CatalogUpdateStreamListResponse>(
            Endpoints.CATALOG_UPDATE_STREAM_ERRORS,
            {
                params: {
                    page,
                    page_size,
                },
            }
        );
    }

}