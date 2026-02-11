// components/ui/badge.tsx
import * as React from "react";

const badgeVariants = {
  default: "bg-slate-700/60 text-slate-200 border border-slate-600/50",
  secondary: "bg-slate-800/50 text-slate-300 border border-slate-700/40",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${badgeVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Badge.displayName = "Badge";

export default Badge;