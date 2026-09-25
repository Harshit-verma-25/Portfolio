import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", {
  variants: {
    variant: {
      default: "border-line bg-white/[0.04] text-zinc-300",
      brand: "border-primary/30 bg-primary/10 text-indigo-200",
      accent: "border-accent/30 bg-accent/10 text-cyan-200",
      success: "border-success/30 bg-success/10 text-green-300",
      warning: "border-warning/30 bg-warning/10 text-amber-300",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
