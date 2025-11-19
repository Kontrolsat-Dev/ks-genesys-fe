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
    <div className="flex flex-col rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        {title}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
