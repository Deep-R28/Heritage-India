import { cn } from "@/lib/cn";

/** Wraps a Material Symbols Outlined glyph — matches the icon set used across every Stitch export. */
export function Icon({
  name,
  className,
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none leading-none", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
