// src/app/layouts/private-layout.tsx
// Layout utilizado para as páginas privadas (autenticadas)

import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./topbar";
import Sidebar from "./sidebar";

const STORAGE_KEY = "sidebar_mini_v1";

const PrivateLayout: React.FC = () => {
  const [mini, setMini] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mini ? "1" : "0");
  }, [mini]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background to-muted text-foreground">
      <div className="flex h-full">
        <Sidebar
          mini={mini}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Content area - single scroll container */}
        <div id="main-scroll-container" className="flex-1 min-w-0 overflow-auto relative">
          {/* Sticky topbar - will stick as user scrolls */}
          <Topbar
            mini={mini}
            isSidebarOpen={mobileOpen}
            onToggleMini={() => setMini((v) => !v)}
            onToggleMobile={() => setMobileOpen((v) => !v)}
          />
          {/* Main content */}
          <main className="px-8 pt-5 pb-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivateLayout;

