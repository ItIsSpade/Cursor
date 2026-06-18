import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-display uppercase tracking-wider font-bold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
          {
            'bg-accent text-background hover:bg-accent-hover hover:shadow-neon-accent': variant === 'primary',
            'bg-secondary text-background hover:bg-secondary-hover': variant === 'secondary',
            'border-2 border-accent text-accent hover:bg-accent hover:text-background': variant === 'outline',
            'text-foreground hover:text-accent hover:bg-white/5': variant === 'ghost',
            'h-9 px-4 text-xs': size === 'sm',
            'h-12 px-8 text-sm': size === 'md',
            'h-16 px-10 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
