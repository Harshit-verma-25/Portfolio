import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-fg placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:border-primary/70 focus-visible:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClass, "h-11 py-0", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClass, "min-h-32 resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(fieldClass, "h-11 py-0 appearance-none bg-bg-elevated", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";
