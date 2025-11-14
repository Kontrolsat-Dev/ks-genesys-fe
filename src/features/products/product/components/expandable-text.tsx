import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  text?: string | null;
  collapsedLines?: number; // default: 2
  minCharsToToggle?: number; // default: 160
  className?: string;
  btnClassName?: string;
  moreLabel?: string; // default: "Ver tudo"
  lessLabel?: string; // default: "Ver menos"
};

export default function ExpandableText({
  text,
  collapsedLines = 2,
  minCharsToToggle = 160,
  className,
  btnClassName,
  moreLabel = "Ver tudo",
  lessLabel = "Ver menos",
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const safe = useMemo(() => (text ?? "").trim(), [text]);
  const hasContent = safe.length > 0;
  const showToggle = hasContent && safe.length >= minCharsToToggle;

  return (
    <div className={cn("space-y-1", className)}>
      <p
        className={cn(
          "text-sm whitespace-pre-wrap leading-relaxed",
          expanded ? "line-clamp-none" : `line-clamp-${collapsedLines}`
        )}
      >
        {hasContent ? safe : "—"}
      </p>

      {showToggle && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className={cn("px-0 h-6", btnClassName)}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? lessLabel : moreLabel}
        </Button>
      )}
    </div>
  );
}
