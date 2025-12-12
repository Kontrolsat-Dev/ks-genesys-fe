// src/app/layouts/topbar.tsx
// Componente Topbar moderno estilo Vercel

import { useHealthz } from "@/features/system/healthz/queries.ts";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Moon,
  Sun,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  Command,
} from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseProductSearch } from "@/lib/product-search";

type Props = {
  onToggleMobile: () => void;
  onToggleMini: () => void;
  isSidebarOpen: boolean;
  mini: boolean;
};

export default function Topbar({
  onToggleMobile,
  onToggleMini,
  isSidebarOpen,
  mini,
}: Props) {
  const { data, isFetching, isError } = useHealthz();

  const status = isError
    ? "critical"
    : !data
    ? "warning"
    : data.status?.toLowerCase();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intent = parseProductSearch(q);
    if (intent.kind === "detail") {
      navigate(`/products/${intent.id}`);
      return;
    }
    const usp = new URLSearchParams();
    if (intent.q) usp.set("q", intent.q);
    if (intent.gtin) usp.set("gtin", intent.gtin);
    if (intent.partnumber) usp.set("partnumber", intent.partnumber);
    usp.set("page", "1");
    navigate(`/products?${usp.toString()}`);
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-4 px-4">
        {/* Left: Toggle buttons */}
        <div className="flex items-center gap-1">
          {/* Mobile menu */}
          <button
            onClick={onToggleMobile}
            aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleMini}
            aria-label={mini ? "Expandir sidebar" : "Colapsar sidebar"}
            className="hidden md:flex p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mini ? (
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-auto">
          <div
            className={cn(
              "relative flex items-center rounded-lg border bg-muted/50 transition-all duration-200",
              searchFocused
                ? "border-foreground/20 bg-background ring-1 ring-foreground/10"
                : "border-transparent hover:bg-muted/80"
            )}
          >
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Pesquisar produtos..."
              className="w-full bg-transparent pl-9 pr-20 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
              aria-label="Pesquisar"
            />
            {/* Keyboard shortcut badge */}
            <div className="absolute right-2 hidden sm:flex items-center gap-1 text-xs text-muted-foreground/60">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">
                <Command className="inline h-2.5 w-2.5" />
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">
                K
              </kbd>
            </div>
          </div>
        </form>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-2">
          {/* Status indicator - minimal with detailed tooltip */}
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-default"
            title={
              isError 
                ? "Backend indisponível" 
                : [
                    `Ambiente: ${data?.env ?? "?"}`,
                    `Status: ${data?.status ?? "?"}`,
                    data?.db_ok !== undefined ? `DB: ${data.db_ok ? "ok" : "down"}` : null,
                    data?.elapsedMs ? `Latência: ${Math.round(data.elapsedMs)}ms` : null,
                  ].filter(Boolean).join("\n")
            }
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                status === "ok" && "bg-emerald-500",
                status === "warning" && "bg-amber-500",
                status === "critical" && "bg-red-500"
              )}
            />
            <span className="text-xs text-muted-foreground hidden lg:inline">
              {isError ? "Erro" : (data?.env ?? "...")}
            </span>
            {isFetching && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Modo claro" : "Modo escuro"}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

