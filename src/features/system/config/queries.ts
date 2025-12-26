// src/features/system/config/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configClient, type PlatformConfigUpdate } from "@/api/config";

export const CONFIG_QUERY_KEY = ["platform-config"];

export function useConfigList() {
    return useQuery({
        queryKey: CONFIG_QUERY_KEY,
        queryFn: () => configClient.list(),
    });
}

export function useUpdateConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, data }: { key: string; data: PlatformConfigUpdate }) =>
            configClient.update(key, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
        },
    });
}

export function useSeedConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => configClient.seed(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
        },
    });
}
