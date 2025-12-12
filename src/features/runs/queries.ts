import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { runsClient } from "@/api/runs";

export const runsKeys = {
  root: ["runs"] as const,
  list: () => [...runsKeys.root, "list"] as const,
};

export function useRunsList() {
  return useQuery({
    queryKey: runsKeys.list(),
    queryFn: () => runsClient.listRuns(),
    placeholderData: keepPreviousData,
    refetchInterval: 10_000,
  });
}
