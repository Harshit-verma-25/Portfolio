import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white text-bg hover:bg-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_30px_-6px_rgba(99,102,241,0.6)]",
        brand:
          "bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-[0_10px_40px_-10px_rgba(99,102,241,0.8)] hover:shadow-[0_10px_50px_-5px_rgba(139,92,246,0.9)]",
        outline: "border border-line-strong bg-white/[0.03] text-fg hover:bg-white/[0.08] hover:border-white/25",
        ghost: "text-muted hover:text-fg hover:bg-white/[0.06]",
        destructive: "bg-danger/90 text-white hover:bg-danger",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
