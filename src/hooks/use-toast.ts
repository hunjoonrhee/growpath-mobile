import { useToastContext } from '@/lib/toast-context';

/** Shows a bottom toast (see ToastHost) - replaces whatever's currently showing. */
export function useToast() {
  return useToastContext().showToast;
}
