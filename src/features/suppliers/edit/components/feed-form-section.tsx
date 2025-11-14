import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";

import FeedOrigin from "@/features/suppliers/create/components/feed-origin";
import FeedAdvanced from "@/features/suppliers/create/components/feed-advanced";
import {
  kvToRecord,
  recordToKV,
  safeParseObjJSON,
  ensureAuthShape,
  type KV,
} from "@/features/suppliers/create/utils";

import type { SupplierDetailOut, SupplierFeedCreate } from "@/api/suppliers";
import { useUpdateSupplierFeed } from "../queries";

type FeedForm = {
  kind: "http" | "ftp" | "supplier";
  format: "csv" | "json" | "xml";
  url: string;
  active: boolean;
  csv_delimiter: string | null;

  auth_kind:
    | "none"
    | "basic"
    | "bearer"
    | "api_key"
    | "oauth_password"
    | "ftp_password";

  headers_kv: KV[];
  params_kv: KV[];
  auth_kv: KV[];

  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body_json_text: string;

  pagination_enabled: boolean;
  page_field?: string;
  size_field?: string;
  page_start?: string;
  page_max_pages?: string;
  page_stop_on_empty?: boolean;
};

type Props = {
  supplierId: number;
  detail?: SupplierDetailOut;
  onBack: () => void;
  onAfterSave: () => Promise<void> | void;
};

export default function FeedFormSection({
  supplierId,
  detail,
  onBack,
  onAfterSave,
}: Props) {
  const feedForm = useForm<FeedForm>({
    defaultValues: {
      kind: "http",
      format: "csv",
      url: "",
      active: true,
      csv_delimiter: ",",
      auth_kind: "none",
      headers_kv: [],
      params_kv: [],
      auth_kv: [],
      method: "GET",
      body_json_text: "",
      pagination_enabled: false,
      page_field: "page",
      size_field: "page_size",
      page_start: "1",
      page_max_pages: "1000",
      page_stop_on_empty: true,
    },
    mode: "onBlur",
  });

  // Prefill com dados do feed
  useEffect(() => {
    const f = detail?.feed;
    if (!f) return;

    const headersObj = safeParseObjJSON(f.headers_json ?? (f as any).headers);
    const paramsObj = safeParseObjJSON(f.params_json ?? (f as any).params);
    const authObj = safeParseObjJSON(f.auth_json ?? (f as any).auth);
    const extraObj = safeParseObjJSON(f.extra_json ?? (f as any).extra);

    let authKV = recordToKV(authObj || {});
    authKV = ensureAuthShape(
      authKV,
      (f as any).auth_kind || undefined,
      f.kind as any
    );

    const baseVals: Partial<FeedForm> = {
      kind: f.kind as any,
      format: f.format as any,
      url: f.url,
      active: f.active,
      csv_delimiter: f.format === "csv" ? f.csv_delimiter ?? "," : null,
      auth_kind: ((f as any).auth_kind as any) ?? "none",
      headers_kv: recordToKV(headersObj || {}),
      params_kv: recordToKV(paramsObj || {}),
      auth_kv: authKV,
      method: "GET",
      body_json_text: "",
      pagination_enabled: false,
      page_field: "page",
      size_field: "page_size",
      page_start: "1",
      page_max_pages: "1000",
      page_stop_on_empty: true,
    };

    if (extraObj && typeof extraObj === "object") {
      if (typeof (extraObj as any).method === "string") {
        baseVals.method = String(
          (extraObj as any).method
        ).toUpperCase() as FeedForm["method"];
      }
      if (
        (extraObj as any).body_json &&
        typeof (extraObj as any).body_json === "object"
      ) {
        baseVals.body_json_text = JSON.stringify(
          (extraObj as any).body_json,
          null,
          2
        );
      }
      if (
        (extraObj as any).pagination &&
        typeof (extraObj as any).pagination === "object"
      ) {
        const p = (extraObj as any).pagination;
        baseVals.pagination_enabled = true;
        baseVals.page_field = p.page_field ?? "page";
        baseVals.size_field = p.size_field ?? "page_size";
        baseVals.page_start = String(p.start ?? "1");
        baseVals.page_max_pages = String(p.max_pages ?? "1000");
        baseVals.page_stop_on_empty =
          typeof p.stop_on_empty === "boolean" ? p.stop_on_empty : true;
      }
    }

    feedForm.reset(baseVals as FeedForm, {
      keepDirty: false,
      keepTouched: false,
    });

    // sincronia extra para watchers
    setTimeout(() => {
      feedForm.setValue("auth_kind", baseVals.auth_kind ?? "none", {
        shouldDirty: false,
      });
      feedForm.setValue("auth_kv", baseVals.auth_kv ?? [], {
        shouldDirty: false,
      });
      feedForm.setValue("headers_kv", baseVals.headers_kv ?? [], {
        shouldDirty: false,
      });
      feedForm.setValue("params_kv", baseVals.params_kv ?? [], {
        shouldDirty: false,
      });
    }, 0);
  }, [detail?.feed, feedForm]);

  const feedKind = feedForm.watch("kind");
  const feedFormat = feedForm.watch("format");
  const feedAuthKind =
    (feedForm.watch("auth_kind") as string | undefined) ?? "none";

  // validar auth_kind permitido por kind
  useEffect(() => {
    const allowed =
      feedKind === "ftp"
        ? ["none", "ftp_password"]
        : ["none", "basic", "bearer", "api_key", "oauth_password"];
    if (!allowed.includes(feedAuthKind)) {
      feedForm.setValue("auth_kind", "none", { shouldDirty: true });
      feedForm.setValue("auth_kv", [], { shouldDirty: true });
      return;
    }
    if (feedAuthKind === "none") {
      feedForm.setValue("auth_kv", [], { shouldDirty: true });
      return;
    }
    const cur = (feedForm.getValues("auth_kv") as KV[]) || [];
    const shaped = ensureAuthShape(cur, feedAuthKind, feedKind as any);
    if (JSON.stringify(cur) !== JSON.stringify(shaped)) {
      feedForm.setValue("auth_kv", shaped, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedKind, feedAuthKind]);

  // gerir csv_delimiter conforme formato
  useEffect(() => {
    if (feedFormat === "csv") {
      const cur = feedForm.getValues("csv_delimiter");
      if (!cur) feedForm.setValue("csv_delimiter", ",", { shouldDirty: true });
    } else if (feedForm.getValues("csv_delimiter") !== null) {
      feedForm.setValue("csv_delimiter", null, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedFormat]);

  // Remount controlado pelo tipo de auth para o bloco avançado
  const watchAuthKind = useWatch({
    control: feedForm.control,
    name: "auth_kind",
  }) as string | undefined;
  const feedAdvancedKey = `adv-${watchAuthKind ?? "none"}`;

  const buildExtra = (v: FeedForm) => {
    if (v.kind !== "http") return {};
    const extra: any = { method: v.method || "GET" };
    const bodyTxt = (v.body_json_text || "").trim();
    if (bodyTxt) {
      try {
        extra.body_json = JSON.parse(bodyTxt);
      } catch {}
    }
    if (v.pagination_enabled) {
      const start = parseInt((v.page_start || "1").trim(), 10);
      const maxPages = parseInt((v.page_max_pages || "1000").trim(), 10);
      extra.pagination = {
        mode: "page",
        page_field: v.page_field || "page",
        size_field: v.size_field || "page_size",
        start: Number.isFinite(start) ? start : 1,
        max_pages: Number.isFinite(maxPages) ? maxPages : 1000,
        stop_on_empty:
          typeof v.page_stop_on_empty === "boolean"
            ? v.page_stop_on_empty
            : true,
      };
    }
    return extra;
  };

  const feedPayloadFromForm = (v: FeedForm): SupplierFeedCreate => ({
    kind: v.kind,
    format: v.format,
    url: v.url,
    active: v.active,
    csv_delimiter: v.format === "csv" ? v.csv_delimiter || "," : undefined,
    headers: kvToRecord(v.headers_kv),
    params: kvToRecord(v.params_kv),
    auth_kind: v.auth_kind && v.auth_kind !== "none" ? v.auth_kind : "none",
    auth: v.auth_kind && v.auth_kind !== "none" ? kvToRecord(v.auth_kv) : null,
    extra: buildExtra(v),
  });

  const updateFeedM = useUpdateSupplierFeed(supplierId, onAfterSave);
  const isBusy = updateFeedM.isPending;

  const onSubmit = (vals: FeedForm) => {
    updateFeedM.mutate(feedPayloadFromForm(vals));
  };

  // UI
  return (
    <FormProvider {...feedForm}>
      <section className="space-y-6">
        <FeedOrigin
          tabKind={feedForm.watch("kind") as any}
          setTabKind={(k) =>
            feedForm.setValue("kind", k, { shouldDirty: true })
          }
        />
        <FeedAdvanced key={feedAdvancedKey} />
      </section>

      <Separator />

      <section className="space-y-4">
        {feedForm.watch("kind") === "http" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-1">
              <Label>Método</Label>
              <select
                className="h-10 w-full rounded-md border px-2 text-sm"
                value={feedForm.watch("method")}
                onChange={(e) =>
                  feedForm.setValue(
                    "method",
                    e.target.value as FeedForm["method"],
                    {
                      shouldDirty: true,
                    }
                  )
                }
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-9 space-y-1">
              <Label>Body JSON (opcional)</Label>
              <Textarea
                className="font-mono text-xs min-h-[120px]"
                placeholder='ex.: { "page": 1, "page_size": 200 }'
                value={feedForm.watch("body_json_text") ?? ""}
                onChange={(e) =>
                  feedForm.setValue("body_json_text", e.target.value, {
                    shouldDirty: true,
                  })
                }
                spellCheck={false}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2 rounded-md border p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="mb-0">Paginar resultados</Label>
              <p className="text-xs text-muted-foreground">
                Modo page (page/size/start/max_pages).
              </p>
            </div>
            <Switch
              checked={!!feedForm.watch("pagination_enabled")}
              onCheckedChange={(v) =>
                feedForm.setValue("pagination_enabled", v, {
                  shouldDirty: true,
                })
              }
            />
          </div>

          {feedForm.watch("pagination_enabled") && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-2">
              <div className="md:col-span-3">
                <Label>Campo página</Label>
                <Input
                  placeholder="page"
                  value={feedForm.watch("page_field") ?? ""}
                  onChange={(e) =>
                    feedForm.setValue("page_field", e.target.value, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
              <div className="md:col-span-3">
                <Label>Campo tamanho</Label>
                <Input
                  placeholder="page_size"
                  value={feedForm.watch("size_field") ?? ""}
                  onChange={(e) =>
                    feedForm.setValue("size_field", e.target.value, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label>Início</Label>
                <Input
                  placeholder="1"
                  value={feedForm.watch("page_start") ?? ""}
                  onChange={(e) =>
                    feedForm.setValue("page_start", e.target.value, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label>Máx. páginas</Label>
                <Input
                  placeholder="1000"
                  value={feedForm.watch("page_max_pages") ?? ""}
                  onChange={(e) =>
                    feedForm.setValue("page_max_pages", e.target.value, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label className="block">Parar quando vazio</Label>
                <div className="flex h-10 items-center">
                  <Switch
                    checked={!!feedForm.watch("page_stop_on_empty")}
                    onCheckedChange={(v) =>
                      feedForm.setValue("page_stop_on_empty", v, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={onBack}>
          Voltar
        </Button>
        <Button
          onClick={feedForm.handleSubmit(onSubmit)}
          disabled={isBusy}
          className="gap-2"
        >
          {isBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
          {isBusy ? "A guardar…" : "Guardar feed"}
        </Button>
      </div>
    </FormProvider>
  );
}
