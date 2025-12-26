// src/api/config/types.ts

export interface PlatformConfig {
    key: string;
    value: string;
    value_type: "int" | "float" | "bool" | "str" | "json";
    category: string;
    description: string | null;
    updated_at: string;
}

export interface PlatformConfigCategoryGroup {
    category: string;
    configs: PlatformConfig[];
}

export interface PlatformConfigListOut {
    total: number;
    categories: PlatformConfigCategoryGroup[];
}

export interface PlatformConfigUpdate {
    value: string;
}

export interface PlatformConfigSeedOut {
    created: number;
    message: string;
}
