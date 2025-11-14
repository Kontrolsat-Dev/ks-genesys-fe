import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useValidateMapper, useUpdateSupplierMapper } from "../queries";

type Props = {
  feedId?: number;
  version?: number | null;
  initialProfile?: Record<string, any> | null;
  onAfterSave: () => Promise<void> | void;
};

export default function MapperEditor({
  feedId,
  version,
  initialProfile,
  onAfterSave,
}: Props) {
  const [mapperText, setMapperText] = useState<string>('{\n  "fields": {}\n}');

  useEffect(() => {
    if (initialProfile && typeof initialProfile === "object") {
      setMapperText(JSON.stringify(initialProfile, null, 2));
    } else {
      setMapperText('{\n  "fields": {}\n}');
    }
  }, [initialProfile]);

  const validateMapperM = useValidateMapper(feedId);
  const saveMapperM = useUpdateSupplierMapper(feedId, onAfterSave);

  const parseMapper = () => {
    try {
      return JSON.parse(mapperText || "{}");
    } catch (e: any) {
      toast.error("JSON inválido no mapper.", {
        description: String(e?.message ?? "Corrija o JSON."),
      });
      return null;
    }
  };

  const onValidateMapper = () => {
    const parsed = parseMapper();
    if (!parsed) return;
    validateMapperM.mutate({ profile: parsed });
  };

  const onSaveMapper = () => {
    const parsed = parseMapper();
    if (!parsed) return;
    if (!feedId) {
      toast.error("Não existe feed associado a este fornecedor.");
      return;
    }
    saveMapperM.mutate({ profile: parsed, bump_version: true });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Perfil (JSON)</Label>
            <p className="text-xs text-muted-foreground">
              Edita o perfil do mapper em JSON. Versão atual:{" "}
              {version !== null ? `v${version}` : "—"}
            </p>
          </div>
          <Badge variant={feedId ? "secondary" : "outline"}>
            {feedId ? `feed #${feedId}` : "sem feed"}
          </Badge>
        </div>
        <Textarea
          className="font-mono text-xs min-h-[320px]"
          value={mapperText}
          onChange={(e) => setMapperText(e.target.value)}
          spellCheck={false}
        />
      </section>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onValidateMapper}
          disabled={validateMapperM.isPending}
          className="gap-2"
        >
          {validateMapperM.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : null}
          {validateMapperM.isPending ? "A validar…" : "Validar"}
        </Button>

        <Button
          type="button"
          onClick={onSaveMapper}
          disabled={saveMapperM.isPending}
          className="gap-2"
        >
          {saveMapperM.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : null}
          {saveMapperM.isPending ? "A guardar…" : "Guardar mapper"}
        </Button>
      </div>
    </div>
  );
}
