import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/** Accessible modal shell (Radix Dialog): focus trap, Esc, scrim, labelled. */
export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/60" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[300] w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border border-border-subtle bg-bg-elevated p-5 shadow-xl focus:outline-none',
            className,
          )}
        >
          <div className="mb-1 flex items-start justify-between gap-4">
            <Dialog.Title className="font-display text-lg font-semibold text-text-primary">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="text-text-tertiary hover:text-text-primary focus-visible:outline-none"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="mb-4 text-sm text-text-secondary">
              {description}
            </Dialog.Description>
          ) : null}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
