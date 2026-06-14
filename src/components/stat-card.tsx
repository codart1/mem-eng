import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: string;
  accent?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex items-center gap-4 py-5">
        {Icon && (
          <div
            className="grid size-11 shrink-0 place-items-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in oklch, ${accent ?? "var(--brand)"} 14%, transparent)`,
              color: accent ?? "var(--brand)",
            }}
          >
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-2xl leading-tight font-semibold tabular-nums">
            {value}
          </div>
          <div className="text-muted-foreground truncate text-sm">{label}</div>
          {hint && (
            <div className="text-muted-foreground/80 mt-0.5 text-xs">{hint}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
