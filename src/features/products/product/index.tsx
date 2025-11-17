import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardAction } from "@/components/ui/card";
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
  ProductLoadingPage,
} from "@/features/products/product/components";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : NaN;
  const nav = useNavigate();

  const [params] = useState<ProductDetailParams>({
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

  if (!Number.isFinite(productId) || productId <= 0) {
    return (
      <div className="p-4">
        <Card className="p-6 border border-destructive bg-destructive/5">
          <p className="text-sm text-destructive font-medium">
            ID de produto inválido.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading && !data) {
    return <ProductLoadingPage />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-6 border border-destructive bg-destructive/5">
          <h1 className="text-lg font-semibold text-destructive mb-2">
            Não foi possível carregar o produto
          </h1>
          <p className="text-sm text-destructive/80">
            {String((error as any)?.message ?? "Erro desconhecido")}
          </p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { product: p, meta, offers, stats, events, best_offer } = data;

  return (
    <div className="space-y-3 ">
      <Card className="p-6">
        <ProductHeader
          product={p}
          onBack={() => nav("/products")}
          onRefresh={() => refetch()}
          isRefreshing={isRefetching}
        />
      </Card>

      <Card className="p-6">
        <ProductStats stats={stats} bestOffer={best_offer} />
      </Card>

      {/* Topo: imagem + info em 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <ProductImageCard product={p} />
        </div>

        <div className="lg:col-span-2">
          <ProductInfo
            product={p}
            metaSlot={<ProductMetaTable meta={meta ?? []} />}
            offersSlot={<ProductOffersTable offers={offers ?? []} />}
          />
        </div>
      </div>

      {/* Gráficos de histórico */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProductPriceChart events={events ?? []} />
        <ProductStockChart events={events ?? []} />
      </div>
    </div>
  );
}
