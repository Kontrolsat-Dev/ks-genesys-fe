import { useRunsList } from "@/features/runs/queries";
// import PageHeader from "@/features/suppliers/components/page-header";
import RunsTable from "./components/runs-table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function RunsPage() {
  const { data, isLoading, refetch, isRefetching } = useRunsList();

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold tracking-tight">Histórico de Runs</h1>
         <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
           <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
           Atualizar
         </Button>
      </div>

      <RunsTable items={data?.items} isLoading={isLoading} />
    </div>
  );
}
