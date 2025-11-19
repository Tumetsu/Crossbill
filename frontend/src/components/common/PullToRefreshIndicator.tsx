import { Box, CircularProgress, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  pullProgress: number;
  isEnabled: boolean;
}

export const PullToRefreshIndicator = ({
  isPulling,
  isRefreshing,
  pullDistance,
  pullProgress,
  isEnabled,
}: PullToRefreshIndicatorProps) => {
  const theme = useTheme();
  const [showIndicator, setShowIndicator] = useState(false);

  // Show indicator when pulling or refreshing
  useEffect(() => {
    if (isPulling || isRefreshing) {
      setShowIndicator(true);
    } else {
      // Delay hiding to allow exit animation
      const timeout = setTimeout(() => setShowIndicator(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isPulling, isRefreshing]);

  if (!isEnabled) return null;

  // Calculate opacity based on pull progress
  const opacity = Math.min(pullProgress * 2, 1); // Fade in faster

  // Calculate rotation for the arrow/spinner
  const rotation = pullProgress * 180; // Half rotation when pulling

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: isRefreshing ? 1 : opacity,
            y: isRefreshing ? 0 : pullDistance * 0.5, // Move down with pull, but less
          }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: 64, // Below AppBar (AppBar height is typically 64px)
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300, // Above most content, below modals
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[4],
            }}
          >
            {isRefreshing ? (
              // Show spinner when refreshing
              <CircularProgress
                size={24}
                sx={{
                  color: theme.palette.primary.main,
                }}
              />
            ) : (
              // Show arrow when pulling
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 0.1, ease: 'linear' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    opacity: pullProgress,
                  }}
                >
                  <path
                    d="M12 4L12 20M12 4L8 8M12 4L16 8"
                    stroke={theme.palette.primary.main}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
