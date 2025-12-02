// src/api/system/services.ts
import {HttpClient} from "@/lib/http-client";
import {Endpoints} from "@/constants/endpoints";
import type {
    HealthResponse
} from "./types";
import {authStore} from "@/lib/auth-store";

export class SystemService {
    private http: HttpClient;

    constructor(http?: HttpClient) {
        this.http =
            http ??
            new HttpClient({
                baseUrl: Endpoints.BASE_URL,
                token: () => authStore.get(),
            });
    }

    getHealthz() {
        return this.http.get<HealthResponse>(Endpoints.HEALTHZ);
    }


}
