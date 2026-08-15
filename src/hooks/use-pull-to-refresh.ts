import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

/**
 * Refetches every currently-active (mounted) query - the simplest correct
 * way to support pull-to-refresh generically across screens, since only the
 * queries the visible screen actually uses are "active" at any given time.
 * Avoids threading individual refetch functions through each screen's own
 * stack of data hooks (some of which, like useGapAnalysis, don't expose
 * them at all).
 */
export function usePullToRefresh() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ type: 'active' });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return { refreshing, onRefresh };
}
