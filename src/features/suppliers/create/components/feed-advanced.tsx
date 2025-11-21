import { useFormContext, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import KVEditor from "./kv-editor";
import type { KV } from "../utils";

type AuthKind =
  | "none"
  | "basic"
  | "bearer"
  | "api_key"
  | "oauth_password"
  | "ftp_password";

export default function FeedAdvanced() {
  const form = useFormContext();

  const kind = useWatch({ control: form.control, name: "kind" }) as
    | "http"
    | "ftp";
  const authKind =
    (useWatch({ control: form.control, name: "auth_kind" }) as AuthKind) ??
    "none";
  const headers_kv =
    (useWatch({ control: form.control, name: "headers_kv" }) as KV[]) || [];
  const params_kv =
    (useWatch({ control: form.control, name: "params_kv" }) as KV[]) || [];
  const auth_kv =
    (useWatch({ control: form.control, name: "auth_kv" }) as KV[]) || [];
  const extra_kv =
    (useWatch({ control: form.control, name: "extra_kv" }) as KV[]) || [];

  const allowedAuth: AuthKind[] =
    kind === "ftp"
      ? ["none", "ftp_password"]
      : ["none", "basic", "bearer", "api_key", "oauth_password"];

  const showCreds =
    authKind && authKind !== "none" && allowedAuth.includes(authKind);

  return (
    <section className="space-y-6">
      {/* Headers + Query params */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="mb-0">Headers</Label>
            <span className="text-[11px] text-muted-foreground">
              Ex.: auth, idioma, etc.
            </span>
          </div>
          <KVEditor
            value={headers_kv}
            onChange={(v) =>
              form.setValue("headers_kv", v, { shouldDirty: true })
            }
            keyPlaceholder="Header"
            valPlaceholder="Valor"
          />
        </div>

        <div className="rounded-md border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="mb-0">Query params</Label>
            <span className="text-[11px] text-muted-foreground">
              Ex.: page, token, filtros…
            </span>
          </div>
          <KVEditor
            value={params_kv}
            onChange={(v) =>
              form.setValue("params_kv", v, { shouldDirty: true })
            }
            keyPlaceholder="param"
            valPlaceholder="valor"
          />
        </div>
      </div>

      {/* Auth + Campos extra */}
      <div className="space-y-4 pt-6 border-t">
        {/* Tipo de autenticação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <FormField
            control={form.control}
            name="auth_kind"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Autenticação</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) => field.onChange(v as AuthKind)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedAuth.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Credenciais */}
          <div className="md:col-span-2">
            {showCreds ? (
              <div className="rounded-md border bg-muted/30 p-3">
                <Label className="mb-2 block text-xs text-muted-foreground">
                  Credenciais
                </Label>
                <KVEditor
                  value={auth_kv}
                  onChange={(v) =>
                    form.setValue("auth_kv", v, { shouldDirty: true })
                  }
                  keyPlaceholder="campo"
                  valPlaceholder="valor"
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Nenhuma autenticação necessária para este feed.
              </p>
            )}
          </div>
        </div>

        {/* Campos extra */}
        <div className="rounded-md border bg-muted/30 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="mb-0">Campos extra</Label>
            <span className="text-[11px] text-muted-foreground">
              Key/Value genéricos para o campo <code>extra</code>.
            </span>
          </div>
          <KVEditor
            value={extra_kv}
            onChange={(v) =>
              form.setValue("extra_kv", v, { shouldDirty: true })
            }
            keyPlaceholder="campo"
            valPlaceholder="valor"
          />
          <p className="text-[11px] text-muted-foreground">
            Estes pares serão enviados em <code>extra.extra_fields</code> no
            backend.
          </p>
        </div>
      </div>
    </section>
  );
}
