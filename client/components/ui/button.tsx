// components/ui/button.tsx
import * as React from "react";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className = "", children, ...props }, ref) => (
  <button
    ref={ref}
    className={`px-4 py-2 rounded-lg font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = "Button";

export default Button;