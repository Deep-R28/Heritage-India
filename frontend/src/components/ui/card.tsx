import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("glass-panel rounded-xl", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHoverable = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "glass-panel rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/40",
        className,
      )}
      {...props}
    />
  ),
);
CardHoverable.displayName = "CardHoverable";
