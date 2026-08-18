import type { LucideIcon } from 'lucide-react-native';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ToastOptions = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  /** Extends the auto-dismiss timer from 3s to 5s and renders a pressable label next to the text. */
  actionLabel?: string;
  onAction?: () => void;
  /** Swaps the selection haptic for a stronger error one - see ToastHost. */
  variant?: 'default' | 'error';
};

type ToastState = ToastOptions & { id: number };

type ToastContextValue = {
  toast: ToastState | null;
  showToast: (options: ToastOptions) => void;
  dismissToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  // One at a time, by design (see the mockup's toast spec) - a new toast
  // replaces whatever's showing rather than queuing behind it.
  const showToast = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = ++idRef.current;
    setToast({ ...options, id });
    const duration = options.actionLabel ? 5000 : 3000;
    timerRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, duration);
  }, []);

  return <ToastContext.Provider value={{ toast, showToast, dismissToast }}>{children}</ToastContext.Provider>;
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
