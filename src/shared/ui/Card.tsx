import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'surface', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-border-subtle',
        variant === 'surface' ? 'bg-bg-surface' : 'bg-bg-elevated',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';
