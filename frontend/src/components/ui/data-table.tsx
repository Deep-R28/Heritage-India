import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

/** No vertical lines, 0.5px hairline row dividers, glass hover state — per DESIGN.md Components. */
export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-hairline">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 font-label text-xs font-semibold uppercase tracking-widest text-foreground-muted",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b border-hairline-strong/60 transition-colors last:border-b-0 hover:bg-surface-hover/60",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-4 font-body text-sm", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
