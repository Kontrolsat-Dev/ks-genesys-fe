import { Link } from "react-router-dom";
import { cx } from "@/lib/utils";

type FieldProps = {
  label: string;
  value: string;
  mono?: boolean;
  link?: boolean;
  target?: string;
  className?: string;
};

export function InfoField({
  label,
  value,
  mono = false,
  link = false,
  target = "",
}: FieldProps) {
  if (link) {
    return (
      <Link className="space-y-1 cursor-pointer" to={target}>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <p className={`text-sm text-foreground underline`}>{value || "—"}</p>
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <p
        className={`text-sm ${
          mono ? "font-mono" : "font-medium"
        } text-foreground`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export function StatItem({
  label,
  value,
  mono = false,
  link = false,
  target = "",
  className, // <- NOVO
}: FieldProps) {
  if (link) {
    return (
      <Link
        to={target}
        className={cx(
          "cursor-pointer flex flex-col items-center gap-1 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-center justify-center",
          className
        )}
      >
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
          {label}
        </div>
        <div
          className={cx(
            mono ? "font-mono" : "",
            "text-sm font-semibold text-foreground underline"
          )}
        >
          {value || "—"}
        </div>
      </Link>
    );
  }

  return (
    <div
      className={cx(
        "flex flex-col items-center gap-1 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-center justify-center",
        className // <- só aqui passamos pointer/extra se quisermos
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
        {label}
      </div>
      <div
        className={cx(
          mono ? "font-mono" : "",
          "text-sm font-semibold text-foreground"
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}
