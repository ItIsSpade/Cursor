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
          "inline-flex items-center justify-center font-display tracking-wide font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none rounded-full",
          {
            'bg-foreground text-background hover:bg-foreground/90 hover:shadow-soft': variant === 'primary',
            'bg-accent text-white hover:bg-accent-hover shadow-soft hover:shadow-lg hover:-translate-y-0.5': variant === 'secondary',
            'border border-border text-foreground hover:border-accent hover:text-accent bg-transparent': variant === 'outline',
            'text-muted hover:text-foreground hover:bg-black/5': variant === 'ghost',
            'h-8 px-4 text-xs': size === 'sm',
            'h-10 px-6 text-sm': size === 'md',
            'h-14 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
