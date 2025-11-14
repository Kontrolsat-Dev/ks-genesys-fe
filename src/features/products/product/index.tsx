import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useProductDetail } from "./queries";
import type { ProductDetailParams } from "@/api/products/types";
import {
  ProductHeader,
  ProductImageCard,
  ProductStats,
  ProductInfo,
  ProductMetaTable,
  ProductOffersTable,
  ProductPriceChart,
  ProductStockChart,
} from "@/features/products/product/components";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : NaN;
  const nav = useNavigate();

  const [params, _setParams] = useState<ProductDetailParams>({
    expand_meta: true,
    expand_offers: true,
    expand_events: true,
    events_days: 90,
    events_limit: 2000,
    aggregate_daily: true,
  });

  const { data, isLoading, isRefetching, refetch, error } = useProductDetail(
    productId,
    params
  );
  const points = useMemo(() => data?.series_daily ?? [], [data?.series_daily]);

  if (!Number.isFinite(productId) || productId <= 0) {
    return (
      <div className="p-4">
        <Card className="p-6">
          <p className="text-sm text-red-500">ID de produto inválido.</p>
        </Card>
      </div>
    );
  }

  if (isLoading && !data) {
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

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-6">
          <h1 className="text-lg font-semibold mb-2">
            Não foi possível carregar o produto
          </h1>
          <p className="text-sm text-muted-foreground">
            {String((error as any)?.message ?? "Erro")}
          </p>
        </Card>
      </div>
    );
  }

  const p = data?.product;

  return (
    <div className="space-y-6">
      <ProductHeader
        product={p}
        onBack={() => nav("/products")}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <ProductImageCard product={p} />
        </div>

        <div className="space-y-6 h-auto">
          <ProductInfo
            product={p}
            metaSlot={<ProductMetaTable meta={data?.meta ?? []} />}
            offersSlot={<ProductOffersTable offers={data?.offers ?? []} />}
          />
          <ProductStats stats={data?.stats} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProductPriceChart points={points} />
        <ProductStockChart points={points} />
      </div>
    </div>
  );
}
