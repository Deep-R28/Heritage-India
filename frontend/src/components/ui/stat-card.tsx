import { Card } from "./card";
import { Icon } from "./icon";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <Card className="flex items-center justify-between p-6">
      <div>
        <span className="mb-1 block font-label text-xs uppercase tracking-widest text-foreground-muted">
          {label}
        </span>
        <span className="font-headline text-4xl text-accent">{value}</span>
      </div>
      <Icon name={icon} className="text-4xl text-foreground-muted/50" />
    </Card>
  );
}
