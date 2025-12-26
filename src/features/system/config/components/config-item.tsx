// src/features/system/config/components/config-item.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Check, X, Pencil, Loader2 } from "lucide-react";
import type { PlatformConfig } from "@/api/config";

interface ConfigItemProps {
    config: PlatformConfig;
    onUpdate: (key: string, value: string) => Promise<void>;
    isUpdating: boolean;
}

export function ConfigItem({ config, onUpdate, isUpdating }: ConfigItemProps) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(config.value);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdate(config.key, value);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setValue(config.value);
        setEditing(false);
    };

    const handleBoolToggle = async (checked: boolean) => {
        setSaving(true);
        try {
            await onUpdate(config.key, checked ? "true" : "false");
        } finally {
            setSaving(false);
        }
    };

    // Render para boolean
    if (config.value_type === "bool") {
        const isOn = config.value.toLowerCase() === "true" || config.value === "1";
        return (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                    <div className="text-sm font-medium font-mono">{config.key}</div>
                    {config.description && (
                        <div className="text-xs text-muted-foreground">
                            {config.description}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Switch
                        checked={isOn}
                        onCheckedChange={handleBoolToggle}
                        disabled={saving || isUpdating}
                    />
                </div>
            </div>
        );
    }

    // Render para outros tipos (int, float, str, json)
    return (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1 space-y-0.5 min-w-0">
                <div className="text-sm font-medium font-mono">{config.key}</div>
                {config.description && (
                    <div className="text-xs text-muted-foreground truncate">
                        {config.description}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 ml-4">
                {editing ? (
                    <>
                        <Input
                            type={config.value_type === "int" || config.value_type === "float" ? "number" : "text"}
                            step={config.value_type === "float" ? "0.01" : undefined}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-32 h-8 text-sm"
                            disabled={saving}
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 text-green-600" />
                            )}
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </>
                ) : (
                    <>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                            {config.value}
                        </code>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditing(true)}
                            disabled={isUpdating}
                        >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
