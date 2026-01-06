// app/layouts/sidebar.tsx
// Sidebar de navegação principal - estilo Vercel

import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Store,
  ChevronRight,
  Boxes,
  Truck,
  TrendingUp,
  Settings2,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarFooter from "./sidebar-footer";

type Props = {
  mini: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

type NavItem = { to: string; label: string };
type NavGroup = {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items: NavItem[];
};

const NAV_ITEMS: NavGroup[] = [
  {
    name: "Fornecedores",
    icon: Store,
    items: [{ to: "/suppliers", label: "Lista de Fornecedores" }],
  },
  {
    name: "Produtos",
    icon: Boxes,
    items: [
      { to: "/products", label: "Produtos" },
      { to: "/brands", label: "Marcas" },
      { to: "/categories", label: "Categorias" },
    ],
  },
  {
    name: "Encomendas",
    icon: Package,
    items: [{ to: "/orders/dropshipping", label: "Dropshipping" }],
  },
  {
    name: "Transportadoras",
    icon: Truck,
    items: [
      { to: "/carriers", label: "Transportadoras" },
      { to: "/carriers/rules", label: "Regras de Envio" },
    ],
  },
  {
    name: "Preços",
    icon: TrendingUp,
    items: [
      { to: "/prices/active-offer", label: "Ofertas ativas" },
      { to: "/prices/catalog", label: "Catálogo completo" },
    ],
  },
  {
    name: "Sistema",
    icon: Settings2,
    items: [
      { to: "/system/config", label: "Configurações" },
      { to: "/system/update-stream", label: "Stream de Updates" },
      { to: "/system/dlq", label: "Erros de stream" },
      { to: "/system/workers", label: "Tarefas" },
      { to: "/system/runs", label: "Histórico de Ingest" },
      { to: "/system/activity", label: "Actividade" },
    ],
  },
];

const GROUPS_KEY = "sidebar_groups_v1";

export default function Sidebar({ mini, mobileOpen, onCloseMobile }: Props) {
  const location = useLocation();

  const allFalse = useMemo(
    () =>
      Object.fromEntries(NAV_ITEMS.map((g) => [g.name, false])) as Record<
        string,
        boolean
      >,
    []
  );

  const readSaved = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(GROUPS_KEY) || "{}"
      ) as Record<string, boolean>;
      const base: Record<string, boolean> = { ...allFalse };
      for (const g of NAV_ITEMS) base[g.name] = saved[g.name] ?? false;
      return base;
    } catch {
      return { ...allFalse };
    }
  };

  const [open, setOpen] = useState<Record<string, boolean>>(() => readSaved());

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(open));
  }, [open]);

  useEffect(() => {
    setOpen((m) => {
      const next = { ...m };
      for (const g of NAV_ITEMS) {
        const active = g.items.some((i) => location.pathname.startsWith(i.to));
        if (active) next[g.name] = true;
      }
      return next;
    });
  }, [location.pathname]);

  const toggleGroup = (name: string) =>
    setOpen((m) => ({ ...m, [name]: !m[name] }));

  const groupIsActive = (g: NavGroup) =>
    g.items.some((i) => location.pathname.startsWith(i.to));

  return (
    <aside
      role="navigation"
      aria-label="Navegação principal"
      className={cn(
        "fixed md:static inset-y-0 left-0 z-40 h-full md:h-screen",
        "border-r border-border/50",
        "bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-xl",
        "transition-[width,transform] duration-200 ease-in-out",
        "flex flex-col",
        mini ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-14 flex items-center border-b border-border/50",
        mini ? "justify-center px-2" : "px-4 gap-3"
      )}>
        <img
          src="/logo.png"
          alt="Genesys"
          className={cn(
            "rounded-full transition-all",
            mini ? "h-8 w-8" : "h-9 w-9"
          )}
        />
        {!mini && (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">Genesys</span>
            <span className="text-[10px] text-muted-foreground truncate">Stock Manager</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-auto sidebar-scroll",
        mini ? "p-2" : "p-3"
      )}>
        {/* Dashboard */}
        <NavLink
          to="/"
          end
          onClick={onCloseMobile}
          title={mini ? "Dashboard" : undefined}
          className={({ isActive }) =>
            cn(
              "group flex items-center rounded-lg transition-colors mb-1",
              mini ? "justify-center p-2.5" : "px-3 py-2 gap-3",
              "hover:bg-muted",
              isActive && "bg-muted text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!mini && (
                <span className={cn(
                  "text-sm",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  Dashboard
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* Divider */}
        {!mini && <div className="h-px bg-border/50 my-3" />}

        {/* Groups */}
        <div className="space-y-1">
          {NAV_ITEMS.map((group) => {
            const { name, icon: Icon, items } = group;
            const isOpen = open[name];
            const isGrpActive = groupIsActive(group);
            const contentId = `group-${name.replace(/\s+/g, "-").toLowerCase()}`;

            return (
              <div key={name}>
                {/* Group header */}
                <button
                  onClick={() => !mini && toggleGroup(name)}
                  title={mini ? name : undefined}
                  className={cn(
                    "w-full flex items-center rounded-lg transition-colors",
                    mini ? "justify-center p-2.5" : "px-3 py-2 gap-3",
                    "hover:bg-muted",
                    isGrpActive && !mini && "text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isGrpActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  />
                  {!mini && (
                    <>
                      <span className={cn(
                        "flex-1 text-left text-sm",
                        isGrpActive ? "font-medium text-foreground" : "text-muted-foreground"
                      )}>
                        {name}
                      </span>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-90"
                        )}
                      />
                    </>
                  )}
                </button>

                {/* Group items */}
                <div
                  id={contentId}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                    mini
                      ? "grid-rows-[0fr] opacity-0 pointer-events-none"
                      : isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  )}
                  aria-hidden={mini || !isOpen}
                >
                  <div className="overflow-hidden">
                    <div className="pl-4 mt-1 space-y-0.5">
                      {items.map(({ to, label }) => (
                        <NavLink
                          to={to}
                          key={to}
                          onClick={onCloseMobile}
                          className={({ isActive }) =>
                            cn(
                              "block pl-5 pr-3 py-1.5 rounded-lg text-sm transition-colors",
                              "border-l-2 -ml-px",
                              isActive
                                ? "border-foreground bg-muted text-foreground font-medium"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )
                          }
                        >
                          {label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <SidebarFooter mini={mini} />
    </aside>
  );
}

