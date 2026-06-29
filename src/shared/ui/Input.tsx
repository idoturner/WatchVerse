import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-11 w-full rounded-md border border-border-strong bg-bg-surface px-3 text-sm text-text-primary',
      'placeholder:text-text-tertiary focus-visible:border-accent focus-visible:outline-none',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
