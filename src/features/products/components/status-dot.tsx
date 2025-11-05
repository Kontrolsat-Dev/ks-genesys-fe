import { cn } from "@/lib/utils";

export default function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        ok ? "bg-emerald-500" : "bg-amber-500"
      )}
    />
  );
}
