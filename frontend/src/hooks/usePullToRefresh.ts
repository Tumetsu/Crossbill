import { useCallback, useEffect, useRef, useState } from 'react';

// Extend Navigator interface to include iOS-specific property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullThreshold?: number;
  maxPullDistance?: number;
  enabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  pullProgress: number; // 0-1 representing progress to threshold
}

export const usePullToRefresh = ({
  onRefresh,
  pullThreshold = 80,
  maxPullDistance = 120,
  enabled = true,
}: UsePullToRefreshOptions) => {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    pullProgress: 0,
  });

  const touchStartY = useRef<number>(0);
  const currentTouchY = useRef<number>(0);

  // Check if we're on iOS PWA in standalone mode
  const isIOSStandalone =
    typeof window !== 'undefined' &&
    window.navigator.standalone === true;

  const shouldEnablePullToRefresh = enabled && isIOSStandalone;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!shouldEnablePullToRefresh || state.isRefreshing) return;

    // Only start tracking if we're at the top of the page
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      currentTouchY.current = e.touches[0].clientY;
    }
  }, [shouldEnablePullToRefresh, state.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!shouldEnablePullToRefresh || state.isRefreshing) return;

    // Only handle pull-down when at top of page
    if (window.scrollY > 0) {
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        pullProgress: 0,
      }));
      return;
    }

    currentTouchY.current = e.touches[0].clientY;
    const pullDistance = currentTouchY.current - touchStartY.current;

    // Only track downward pulls
    if (pullDistance > 0) {
      // Prevent default to stop native behavior
      e.preventDefault();

      // Apply rubber band effect: diminishing returns as pull distance increases
      const dampingFactor = 0.5;
      const dampedDistance = Math.min(
        pullDistance * dampingFactor,
        maxPullDistance
      );

      const progress = Math.min(dampedDistance / pullThreshold, 1);

      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance: dampedDistance,
        pullProgress: progress,
      }));
    }
  }, [shouldEnablePullToRefresh, state.isRefreshing, pullThreshold, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!shouldEnablePullToRefresh || state.isRefreshing) return;

    const { isPulling, pullDistance } = state;

    if (isPulling && pullDistance >= pullThreshold) {
      // Trigger refresh
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }));

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          pullProgress: 0,
        }));
      }
    } else {
      // Reset state if threshold not met
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        pullProgress: 0,
      }));
    }

    touchStartY.current = 0;
    currentTouchY.current = 0;
  }, [shouldEnablePullToRefresh, state, pullThreshold, onRefresh]);

  useEffect(() => {
    if (!shouldEnablePullToRefresh) return;

    // Add touch event listeners
    // Use passive: false to allow preventDefault
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [shouldEnablePullToRefresh, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ...state,
    isEnabled: shouldEnablePullToRefresh,
  };
};
