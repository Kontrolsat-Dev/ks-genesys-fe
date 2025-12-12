// src/features/suppliers/edit/components/supplier-form-section.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RefreshCw } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";

export type SupplierForm = {
  name: string;
  active: boolean;
  logo_image: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  margin: number | null;
  country: string | null;
  ingest_enabled: boolean;
  ingest_interval_minutes: number | null;
  ingest_next_run_at: string | null;
};

type Props = {
  form: UseFormReturn<SupplierForm>;
  isBusy?: boolean;
  onSubmit: (vals: SupplierForm) => void;
  onCancel: () => void;
};

export default function SupplierFormSection({
  form,
  isBusy,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      {/* --- Dados básicos --- */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 space-y-2">
          <Label>Nome</Label>
          <Input
            placeholder="Nome do fornecedor"
            {...form.register("name", { required: true })}
            disabled={!!isBusy}
          />
        </div>

        <div className="md:col-span-3 space-y-2">
          <Label>País</Label>
          <Input
            placeholder="PT"
            {...form.register("country")}
            disabled={!!isBusy}
          />
        </div>

        <div className="md:col-span-3 space-y-2">
          <Label className="block">Ativo</Label>
          <div className="h-10 flex items-center">
            <Switch
              checked={!!form.watch("active")}
              onCheckedChange={(v) =>
                form.setValue("active", v, { shouldDirty: true })
              }
              disabled={!!isBusy}
            />
          </div>
        </div>

        <div className="md:col-span-6 space-y-2">
          <Label>Logo (URL)</Label>
          <Input
            placeholder="https://…"
            value={form.watch("logo_image") ?? ""}
            onChange={(e) =>
              form.setValue("logo_image", e.target.value || null, {
                shouldDirty: true,
              })
            }
            disabled={!!isBusy}
          />
        </div>

        <div className="md:col-span-3 space-y-2">
          <Label>Margem (%)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="10"
            value={form.watch("margin") ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              form.setValue("margin", v === "" ? null : Number(v), {
                shouldDirty: true,
              });
            }}
            disabled={!!isBusy}
          />
        </div>
      </section>

      <Separator />

      {/* --- Agendamento de ingest --- */}
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-5 space-y-2">
          <Label>Intervalo de atualizações (min)</Label>
          <Input
            type="number"
            placeholder="60"
            // importante: garantir número, não string
            {...form.register("ingest_interval_minutes", {
              required: true,
              valueAsNumber: true,
            })}
            disabled={!!isBusy}
          />
        </div>

        <div className="col-span-5 space-y-2">
          <Label className="flex items-baseline">
            Próxima execução{" "}
            <span className="text-xs">(Gerido pelo sistema)</span>
          </Label>
          <Input
            placeholder="Gerido automaticamente pelo sistema"
            {...form.register("ingest_next_run_at")}
            disabled={true}
          />
          {/* Se quiseres deixar totalmente read-only, troca por:
          <Input
            placeholder="Gerido automaticamente pelo sistema"
            value={form.watch("ingest_next_run_at") ?? ""}
            disabled
          />
          */}
        </div>

        <div className="col-span-2 space-y-2">
          <Label className="block">Atualização de feed</Label>
          <div className="h-10 flex items-center">
            <Switch
              checked={!!form.watch("ingest_enabled")}
              onCheckedChange={(v) =>
                form.setValue("ingest_enabled", v, { shouldDirty: true })
              }
              disabled={!!isBusy}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* --- Contactos --- */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 space-y-2">
          <Label>Contacto (nome)</Label>
          <Input
            placeholder="Nome do contacto"
            value={form.watch("contact_name") ?? ""}
            onChange={(e) =>
              form.setValue("contact_name", e.target.value || null, {
                shouldDirty: true,
              })
            }
            disabled={!!isBusy}
          />
        </div>
        <div className="md:col-span-4 space-y-2">
          <Label>Contacto (telefone)</Label>
          <Input
            placeholder="+351…"
            value={form.watch("contact_phone") ?? ""}
            onChange={(e) =>
              form.setValue("contact_phone", e.target.value || null, {
                shouldDirty: true,
              })
            }
            disabled={!!isBusy}
          />
        </div>
        <div className="md:col-span-4 space-y-2">
          <Label>Contacto (email)</Label>
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={form.watch("contact_email") ?? ""}
            onChange={(e) =>
              form.setValue("contact_email", e.target.value || null, {
                shouldDirty: true,
              })
            }
            disabled={!!isBusy}
          />
        </div>
      </section>

      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          disabled={!!isBusy}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={!!isBusy} className="gap-2">
          {isBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
          {isBusy ? "A guardar…" : "Guardar alterações"}
        </Button>
      </div>
    </form>
  );
}
