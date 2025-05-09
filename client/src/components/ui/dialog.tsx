import React, { useEffect } from 'react';
import './Dialog.css';

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export const Dialog = ({ open, onOpenChange, children, className = '' }: DialogProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onOpenChange]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={`dialog-overlay ${className}`} onClick={() => onOpenChange(false)}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="dialog-title">{children}</h2>
);

export const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="dialog-footer">{children}</div>
);

export const DialogClose = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="dialog-close">
    &times;
  </button>
);
