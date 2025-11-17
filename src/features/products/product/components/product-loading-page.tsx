import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoadingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <Skeleton className="h-16 w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-16 w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-16 w-full" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-16 w-full" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="lg:col-span-2 p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-72 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-72 w-full" />
        </Card>
      </div>
    </div>
  );
}
