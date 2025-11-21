import { useEffect, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

import FeedOrigin from "./feed-origin";
import FeedAdvanced from "./feed-advanced";
import FeedTestPreview from "./feed-test-preview";
import {
  kvToRecord,
  recordToKV,
  safeParseObjJSON,
  ensureAuthShape,
  type KV,
} from "../utils";

import { useSupplierFeed, useUpsertFeed, useTestFeed } from "../queries";
import type { SupplierFeedOut } from "@/api/suppliers";

type FormValues = {
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
  extra_kv: KV[]; // <-- NOVO
  max_rows: number;

  // EXTRA (HTTP)
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body_json_text: string;
  pagination_enabled: boolean;
  page_field?: string;
  size_field?: string;
  page_start?: string;
  page_max_pages?: string;
  page_stop_on_empty?: boolean;

  // EXTRA (FTP)
  trigger_http_url?: string;
  trigger_http_method?: "GET" | "POST";
  compression?: "none" | "zip";
  zip_entry_name?: string;
};

type Props = {
  supplierId: number | null;
  isActive?: boolean;
  onBack: () => void;
  onNext: (feedId: number) => void;
  onSkip: () => void;
};

export default function StepFeed({
  supplierId,
  isActive = true,
  onBack,
  onNext,
  onSkip,
}: Props) {
  const [tabKind, setTabKind] = useState<"http" | "ftp">("http");
  const feedQ = useSupplierFeed(supplierId || undefined);
  const upsertM = useUpsertFeed(supplierId || 0);
  const testM = useTestFeed();

  const methods = useForm<FormValues>({
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
      extra_kv: [], // <-- NOVO
      max_rows: 5,

      method: "GET",
      body_json_text: "",
      pagination_enabled: false,
      page_field: "page",
      size_field: "page_size",
      page_start: "1",
      page_max_pages: "1000",
      page_stop_on_empty: true,

      trigger_http_url: "",
      trigger_http_method: "GET",
      compression: "none",
      zip_entry_name: "",
    },
    mode: "onBlur",
  });

  const { handleSubmit, watch, reset, setValue, control } = methods;

  // Prefill quando já existe feed
  useEffect(() => {
    const d = feedQ.data as SupplierFeedOut | undefined;
    if (!isActive || !d) return;

    const headersObj = safeParseObjJSON(
      (d as any).headers_json ?? (d as any).headers
    );
    const paramsObj = safeParseObjJSON(
      (d as any).params_json ?? (d as any).params
    );
    const authObj = safeParseObjJSON((d as any).auth_json ?? (d as any).auth);
    const extraObj = safeParseObjJSON(
      (d as any).extra_json ?? (d as any).extra
    ) as any | null;

    let authKV = recordToKV(authObj || {});
    authKV = ensureAuthShape(
      authKV,
      (d as any).auth_kind || undefined,
      d.kind as any
    );

    const baseVals: Partial<FormValues> = {
      kind: d.kind as any,
      format: d.format as any,
      url: d.url,
      active: d.active,
      csv_delimiter: d.format === "csv" ? d.csv_delimiter ?? "," : null,
      auth_kind: ((d as any).auth_kind as any) ?? "none",
      headers_kv: recordToKV(headersObj || {}),
      params_kv: recordToKV(paramsObj || {}),
      auth_kv: authKV,
      extra_kv: [], // default
      max_rows: 5,
      method: "GET",
      body_json_text: "",
      pagination_enabled: false,
      page_field: "page",
      size_field: "page_size",
      page_start: "1",
      page_max_pages: "1000",
      page_stop_on_empty: true,
      trigger_http_url: "",
      trigger_http_method: "GET",
      compression: "none",
      zip_entry_name: "",
    };

    if (extraObj && typeof extraObj === "object") {
      // HTTP extras
      if (typeof extraObj.method === "string") {
        baseVals.method = String(
          extraObj.method
        ).toUpperCase() as FormValues["method"];
      }
      if (extraObj.body_json && typeof extraObj.body_json === "object") {
        baseVals.body_json_text = JSON.stringify(extraObj.body_json, null, 2);
      }
      if (extraObj.pagination && typeof extraObj.pagination === "object") {
        const p = extraObj.pagination as any;
        baseVals.pagination_enabled = true;
        baseVals.page_field = p.page_field ?? "page";
        baseVals.size_field = p.size_field ?? "page_size";
        baseVals.page_start = String(p.start ?? "1");
        baseVals.page_max_pages = String(p.max_pages ?? "1000");
        baseVals.page_stop_on_empty =
          typeof p.stop_on_empty === "boolean" ? p.stop_on_empty : true;
      }

      // FTP extras
      if (typeof extraObj.trigger_http_url === "string") {
        baseVals.trigger_http_url = extraObj.trigger_http_url;
      }
      if (typeof extraObj.trigger_http_method === "string") {
        const mh = String(extraObj.trigger_http_method).toUpperCase();
        baseVals.trigger_http_method = (mh === "POST" ? "POST" : "GET") as
          | "GET"
          | "POST";
      }
      if (typeof extraObj.compression === "string") {
        const c = String(extraObj.compression).toLowerCase();
        baseVals.compression = c === "zip" ? "zip" : "none";
      }
      if (typeof extraObj.zip_entry_name === "string") {
        baseVals.zip_entry_name = extraObj.zip_entry_name;
      }

      // Campos extra genéricos
      if (extraObj.extra_fields && typeof extraObj.extra_fields === "object") {
        baseVals.extra_kv = recordToKV(
          extraObj.extra_fields as Record<string, any>
        );
      }
    }

    reset(baseVals as FormValues, { keepDirty: false, keepTouched: false });
    setTabKind(d.kind as any);

    // garantir notificação dos watchers
    setTimeout(() => {
      setValue("auth_kind", baseVals.auth_kind ?? "none", {
        shouldDirty: false,
      });
      setValue("auth_kv", baseVals.auth_kv ?? [], { shouldDirty: false });
      setValue("headers_kv", baseVals.headers_kv ?? [], { shouldDirty: false });
      setValue("params_kv", baseVals.params_kv ?? [], { shouldDirty: false });
      setValue("extra_kv", baseVals.extra_kv ?? [], { shouldDirty: false });
    }, 0);
  }, [feedQ.data, isActive, reset, setValue]);

  // EXTRA builder (HTTP + FTP + extra_fields)
  const buildExtra = (v: FormValues): Record<string, any> => {
    const extra: Record<string, any> = {};

    if (v.kind === "http") {
      extra.method = v.method || "GET";

      const bodyTxt = (v.body_json_text || "").trim();
      if (bodyTxt) {
        try {
          extra.body_json = JSON.parse(bodyTxt);
        } catch {
          // ignora JSON inválido
        }
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
    }

    if (v.kind === "ftp") {
      const triggerUrl = (v.trigger_http_url || "").trim();
      if (triggerUrl) {
        extra.trigger_http_url = triggerUrl;
        extra.trigger_http_method = (
          v.trigger_http_method || "GET"
        ).toUpperCase();
      }
    }

    // Compressão
    if (v.compression === "zip") {
      extra.compression = "zip";
      const name = (v.zip_entry_name || "").trim();
      if (name) {
        extra.zip_entry_name = name;
      }
    }

    // Campos extra genéricos
    const extraFields = kvToRecord(v.extra_kv || []);
    if (extraFields && Object.keys(extraFields).length > 0) {
      extra.extra_fields = extraFields;
    }

    return extra;
  };

  const payloadFromForm = (v: FormValues) => ({
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

  const submit = (vals: FormValues) => {
    if (!supplierId) return;
    upsertM.mutate(payloadFromForm(vals), {
      onSuccess: (out) => onNext(out.id),
    });
  };

  const [preview, setPreview] = useState<{
    ok: boolean;
    status_code: number;
    content_type?: string | null;
    bytes_read: number;
    preview_type?: "csv" | "json" | "xml" | null;
    rows_preview: any[];
    error?: string | null;
  } | null>(null);

  const doTest = async () => {
    const vals = methods.getValues();
    const body = {
      ...payloadFromForm(vals),
      max_rows: vals.max_rows ?? 20,
    } as any;
    try {
      const res = await testM.mutateAsync(body);
      setPreview(res as any);
    } catch {
      // erros já tratados no preview
    }
  };

  const clearPreview = () => setPreview(null);

  // watchers para auto-injeção de credenciais por tipo
  const kind = watch("kind");
  const authKind = (watch("auth_kind") as string | undefined) ?? "none";
  const format = watch("format");

  useEffect(() => {
    const allowed =
      kind === "ftp"
        ? ["none", "ftp_password"]
        : ["none", "basic", "bearer", "api_key", "oauth_password"];

    if (!allowed.includes(authKind!)) {
      methods.setValue("auth_kind", "none", { shouldDirty: true });
      methods.setValue("auth_kv", [], { shouldDirty: true });
      return;
    }
    if (authKind === "none") {
      methods.setValue("auth_kv", [], { shouldDirty: true });
      return;
    }
    const cur = (methods.getValues("auth_kv") as KV[]) || [];
    const shaped = ensureAuthShape(cur, authKind, kind as any);
    if (JSON.stringify(cur) !== JSON.stringify(shaped)) {
      methods.setValue("auth_kv", shaped, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, authKind]);

  useEffect(() => {
    if (format === "csv") {
      const cur = methods.getValues("csv_delimiter");
      if (!cur) methods.setValue("csv_delimiter", ",", { shouldDirty: true });
    } else if (methods.getValues("csv_delimiter") !== null) {
      methods.setValue("csv_delimiter", null, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  const isHttp = kind === "http";

  // Remount controlado: apenas quando muda o tipo de auth
  const watchAuthKind = useWatch({ control, name: "auth_kind" }) as
    | string
    | undefined;
  const feedAdvancedKey = `adv-${watchAuthKind ?? "none"}`;

  return (
    <>
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Feed do fornecedor</CardTitle>
            <CardDescription>
              Define a fonte de dados e testa uma amostra.
            </CardDescription>
          </div>
          <Badge variant={watch("active") ? "secondary" : "outline"}>
            {watch("active") ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-0 pt-4">
        <FormProvider {...methods}>
          <FeedOrigin tabKind={tabKind} setTabKind={setTabKind} />

          {/* Avançado (headers/params/auth/extra) */}
          <FeedAdvanced key={feedAdvancedKey} />

          {/* Extra (HTTP) */}
          {isHttp && (
            <>
              <Separator />
              {/* ... resto do bloco HTTP como já tinhas ... */}
            </>
          )}

          {/* Extra (FTP) */}
          {!isHttp && (
            <>
              <Separator />
              {/* ... resto do bloco FTP como já tinhas ... */}
            </>
          )}

          <Separator />
          <FeedTestPreview
            preview={preview}
            onTest={doTest}
            onClear={clearPreview}
            testing={testM.isPending}
          />
        </FormProvider>
      </CardContent>

      <CardFooter className="flex justify-between p-0 pt-6">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <div className="flex gap-2">
          {feedQ.data?.id ? (
            <Button
              variant="secondary"
              onClick={() => onNext(feedQ.data!.id)}
              title="Avançar para o mapeamento sem guardar alterações"
            >
              Ir para mapeamento
            </Button>
          ) : null}

          <Button variant="outline" onClick={onSkip}>
            Concluir mais tarde
          </Button>
          <Button
            onClick={handleSubmit(submit)}
            disabled={upsertM.isPending}
            className="gap-2"
          >
            {upsertM.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : null}
            {upsertM.isPending ? "A guardar…" : "Guardar e continuar"}
          </Button>
        </div>
      </CardFooter>
    </>
  );
}
