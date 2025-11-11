import { Box } from '@mui/material';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AppBar } from '../components/layout/AppBar';

export const Route = createRootRoute({
  component: () => (
    <Box>
      <AppBar />
      <Outlet />
      <TanStackRouterDevtools />
    </Box>
  ),
});
