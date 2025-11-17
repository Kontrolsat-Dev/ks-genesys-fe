import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoadingPage() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </Card>
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <Card className="p-6">
          <Skeleton className="h-48 w-full" />
        </Card>
        <Card className="p-6 2xl:col-span-2">
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );
}
