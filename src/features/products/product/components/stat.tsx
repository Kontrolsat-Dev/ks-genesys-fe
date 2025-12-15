export default function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm">
      <div className="flex items-center gap-2">
        {icon && (
          <div className="flex h-5 w-5 items-center justify-center text-muted-foreground/70 transition-colors group-hover:text-foreground">
            {icon}
          </div>
        )}
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

