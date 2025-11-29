// src/features/suppliers/edit/index.tsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSupplierDetail } from "../queries";
import { supplierKeys } from "../queries";
import { useUpdateSupplierOnly } from "./queries";

import SupplierHeader from "./components/supplier-header";
import SupplierFormSection, {
  type SupplierForm,
} from "./components/supplier-form-section";
import FeedFormSection from "./components/feed-form-section";
import MapperEditor from "./components/mapper-editor";

import type { SupplierDetailOut } from "@/api/suppliers";

export default function SupplierEditPage() {
  const { id } = useParams<{ id: string }>();
  const supplierId = id ? Number(id) : NaN;
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useSupplierDetail(
    Number.isFinite(supplierId) ? supplierId : undefined
  );

  // -------- supplier form --------
  const supForm = useForm<SupplierForm>({
    defaultValues: {
      name: "",
      active: true,
      logo_image: null,
      contact_name: null,
      contact_phone: null,
      contact_email: null,
      margin: null,
      country: null,
      ingest_enabled: true,
      ingest_interval_minutes: 61,
      ingest_next_run_at: null,
    },
    mode: "onBlur",
  });

  // prefill supplier fields
  useEffect(() => {
    if (!data) return;
    const s = data.supplier;
    supForm.reset(
      {
        name: s.name ?? "",
        active: !!s.active,
        logo_image: s.logo_image ?? null,
        contact_name: s.contact_name ?? null,
        contact_phone: s.contact_phone ?? null,
        contact_email: s.contact_email ?? null,
        margin: typeof s.margin === "number" ? s.margin : null,
        country: s.country ?? null,
        ingest_enabled: !!s.ingest_enabled,
        ingest_interval_minutes: s.ingest_interval_minutes ?? null,
        ingest_next_run_at: s.ingest_next_run_at ?? null,
      },
      { keepDirty: false, keepTouched: false }
    );
  }, [data, supForm]);

  const updateSupplierM = useUpdateSupplierOnly(supplierId, async () => {
    await qc.invalidateQueries({ queryKey: supplierKeys.root });
    await refetch();
  });

  const submitSupplier = (vals: SupplierForm) => {
    updateSupplierM.mutate({
      name: vals.name,
      active: vals.active,
      logo_image: emptyToNull(vals.logo_image),
      contact_name: emptyToNull(vals.contact_name),
      contact_phone: emptyToNull(vals.contact_phone),
      contact_email: emptyToNull(vals.contact_email),
      margin: vals.margin ?? 0,
      country: emptyToNull(vals.country),
      ingest_enabled: vals.ingest_enabled,
      ingest_interval_minutes: vals.ingest_interval_minutes,
      ingest_next_run_at: emptyToNull(vals.ingest_next_run_at),
    });
  };

  const onAfterSave = async () => {
    await qc.invalidateQueries({ queryKey: supplierKeys.root });
    await refetch();
  };

  const supplierName = (data as SupplierDetailOut | undefined)?.supplier?.name;
  const supplierActive = supForm.watch("active");

  const feedId = data?.feed?.id ?? undefined;
  const mapperVersion = data?.mapper?.version ?? null;
  const mapperProfile = data?.mapper?.profile ?? null;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl p-5">
        <SupplierHeader name={supplierName} active={supplierActive} />
      </Card>

      <Card className="p-6">
        <Tabs defaultValue="supplier">
          <TabsList>
            <TabsTrigger value="supplier">Fornecedor</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="mapper">Mapper</TabsTrigger>
          </TabsList>

          <TabsContent value="supplier" className="space-y-6 pt-4">
            <SupplierFormSection
              form={supForm}
              isBusy={isLoading || updateSupplierM.isPending}
              onSubmit={submitSupplier}
              onCancel={() => nav("/suppliers")}
            />
          </TabsContent>

          <TabsContent value="feed" className="space-y-6 pt-4">
            <FeedFormSection
              supplierId={supplierId}
              detail={data}
              onBack={() => nav("/suppliers")}
              onAfterSave={onAfterSave}
            />
          </TabsContent>

          <TabsContent value="mapper" className="space-y-6 pt-4">
            <MapperEditor
              feedId={feedId}
              version={mapperVersion}
              initialProfile={mapperProfile ?? undefined}
              onAfterSave={onAfterSave}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function emptyToNull<T extends string | null | undefined>(v: T): string | null {
  if (v === undefined || v === null) return null;
  return v.trim() === "" ? null : v;
}
