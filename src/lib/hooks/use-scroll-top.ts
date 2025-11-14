// src/lib/hooks/use-scroll-top.ts
import { useEffect } from "react";

type Options = {
  deps: any[];
  offset?: number; // se precisares compensar topbar fixa
  behavior?: ScrollBehavior; // "auto" | "smooth"
  delayMs?: number; // raros casos, podes atrasar o scroll
};

function getScrollRoot(): HTMLElement | Window {
  const el = document.getElementById("app-scroll-root");
  return el ?? window;
}

export function useScrollTop({
  deps,
  offset = 0,
  behavior = "smooth",
  delayMs = 0,
}: Options) {
  useEffect(() => {
    const root = getScrollRoot();

    const doScroll = () => {
      if (root instanceof Window) {
        window.scrollTo({ top: Math.max(0, offset), behavior });
      } else {
        root.scrollTo({ top: Math.max(0, offset), behavior });
      }
    };

    // Garantir que o DOM já pintou a nova página:
    const run = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(doScroll);
      });
    };

    if (delayMs > 0) {
      const t = setTimeout(run, delayMs);
      return () => clearTimeout(t);
    } else {
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Versão imperativa se precisares chamar após um evento */
export function scrollTopNow(offset = 0, behavior: ScrollBehavior = "smooth") {
  const root = getScrollRoot();
  if (root instanceof Window) {
    window.scrollTo({ top: Math.max(0, offset), behavior });
  } else {
    root.scrollTo({ top: Math.max(0, offset), behavior });
  }
}
