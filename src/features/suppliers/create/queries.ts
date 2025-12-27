import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { suppliersClient } from "@/api/suppliers";
import type {
  Supplier,
  SupplierCreate,
  SupplierFeedCreate,
  SupplierFeedOut,
  FeedTestRequest,
  FeedTestResponse,
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
} from "@/api/suppliers";

// Criar supplier
export function useCreateSupplier() {
  return useMutation({
    mutationFn: (payload: SupplierCreate) =>
      suppliersClient.createSupplier(payload),
    onSuccess: (data) => {
      toast.success(`Fornecedor "${data.name}" criado com sucesso`);
    },
    onError: (err: any) => {
      toast.error("Erro ao criar fornecedor", {
        description: err?.message || "Verifica os dados e tenta novamente",
      });
    },
  });
}

// Feed
export function useSupplierFeed(supplierId?: number) {
  return useQuery({
    queryKey: ["supplier-feed", supplierId],
    queryFn: () => suppliersClient.getSupplierFeed(supplierId!),
    enabled: !!supplierId,
    staleTime: 30_000,
  });
}

export function useUpsertFeed(supplierId: number) {
  return useMutation({
    mutationFn: (payload: SupplierFeedCreate) =>
      suppliersClient.upsertSupplierFeed(supplierId, payload),
    onSuccess: () => {
      toast.success("Feed configurado com sucesso");
    },
    onError: (err: any) => {
      toast.error("Erro ao configurar feed", {
        description: err?.message || "Verifica a URL e tenta novamente",
      });
    },
  });
}

export function useTestFeed() {
  return useMutation({
    mutationFn: (payload: FeedTestRequest) => suppliersClient.testFeed(payload),
    onSuccess: (data) => {
      toast.success(
        `Feed testado com sucesso! ${
          data.rows_preview?.length || 0
        } linhas encontradas`
      );
    },
    onError: (err: any) => {
      toast.error("Erro ao testar feed", {
        description: err?.message || "URL inacessível ou formato inválido",
      });
    },
  });
}

// Mapper (guardar via /suppliers/{id})
type MapperUpsert = {
  profile: Record<string, any>;
  bump_version?: boolean;
};

export function useUpsertMapper(feedId: number) {
  return useMutation({
    mutationFn: (payload: MapperUpsert) =>
      suppliersClient.updateSupplierMapper(feedId, payload),
    onSuccess: () => {
      toast.success("Mapper guardado com sucesso");
    },
    onError: (err: any) => {
      toast.error("Erro ao guardar mapper", {
        description: err?.message || "Verifica a configuração",
      });
    },
  });
}

// Validar mapper (precisa de feedId)
export function useValidateMapper(feedId: number) {
  return useMutation({
    mutationFn: (payload: MapperValidateIn) =>
      suppliersClient.validateMapper(feedId, payload),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Mapper válido!");
      } else {
        toast.warning("Mapper tem erros/avisos", {
          description: `${res.errors?.length || 0} erros, ${
            res.warnings?.length || 0
          } avisos`,
        });
      }
    },
    onError: (err: any) => {
      toast.error("Falha na validação do mapper", {
        description: err?.message || "Verifica a sintaxe",
      });
    },
  });
}

// Ler mapper por supplier
export function useMapperBySupplier(supplierId?: number) {
  return useQuery({
    queryKey: ["mapper-by-supplier", supplierId],
    queryFn: () => suppliersClient.getMapperBySupplier(supplierId!),
    enabled: !!supplierId,
    staleTime: 30_000,
  });
}

// Ler mapper por feed (opcional, se precisares)
export function useMapperByFeed(feedId?: number) {
  return useQuery({
    queryKey: ["mapper-by-feed", feedId],
    queryFn: () => suppliersClient.getMapperByFeed(feedId!),
    enabled: !!feedId,
    staleTime: 30_000,
  });
}

// Operações suportadas pelo mapper
export function useMapperOps() {
  return useQuery({
    queryKey: ["mapper-ops"],
    queryFn: () => suppliersClient.listMapperOps(),
    staleTime: Infinity,
  });
}

export type {
  Supplier,
  SupplierCreate,
  SupplierFeedCreate,
  SupplierFeedOut,
  FeedTestRequest,
  FeedTestResponse,
  FeedMapperOut,
  MapperValidateIn,
  MapperValidateOut,
};
