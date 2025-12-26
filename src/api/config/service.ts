// src/api/config/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type {
    PlatformConfig,
    PlatformConfigListOut,
    PlatformConfigUpdate,
    PlatformConfigSeedOut,
} from "./types";

export class ConfigService {
    private http: HttpClient;

    constructor(http?: HttpClient) {
        this.http =
            http ??
            new HttpClient({
                baseUrl: Endpoints.BASE_URL,
                token: () => authStore.get(),
            });
    }

    /**
     * Lista todas as configurações agrupadas por categoria.
     * GET /config
     */
    list() {
        return this.http.get<PlatformConfigListOut>(Endpoints.CONFIG);
    }

    /**
     * Obtém uma configuração por chave.
     * GET /config/{key}
     */
    get(key: string) {
        return this.http.get<PlatformConfig>(Endpoints.CONFIG_BY_KEY(key));
    }

    /**
     * Atualiza o valor de uma configuração.
     * PUT /config/{key}
     */
    update(key: string, data: PlatformConfigUpdate) {
        return this.http.put<PlatformConfig>(Endpoints.CONFIG_BY_KEY(key), data);
    }

    /**
     * Popular configurações com valores default (reset de fábrica).
     * POST /config/seed
     */
    seed() {
        return this.http.post<PlatformConfigSeedOut>(Endpoints.CONFIG_SEED, {});
    }
}
