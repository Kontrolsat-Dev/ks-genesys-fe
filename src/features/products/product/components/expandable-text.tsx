import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { htmlToPlainText } from "@/helpers/html";

type Props = {
  text?: string | null;
  collapsedLines?: number;
  minCharsToToggle?: number;
  className?: string;
  btnClassName?: string;
  moreLabel?: string;
  lessLabel?: string;
};

export default function ExpandableText({
  text,
  minCharsToToggle = 160,
  className,
  btnClassName,
  moreLabel = "Ver tudo",
  lessLabel = "Ver menos",
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const safe = useMemo(() => htmlToPlainText(text), [text]);

  const hasContent = safe.length > 0;
  const showToggle = hasContent && safe.length >= minCharsToToggle;

  return (
    <div className={cn("space-y-1", className)}>
      <p
        className={cn(
          "text-sm whitespace-pre-wrap leading-relaxed",
          expanded ? "line-clamp-none" : "line-clamp-2"
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
