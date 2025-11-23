import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet, createRootRoute, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AppBar } from '../components/layout/AppBar';
import { useAuth } from '../context/AuthContext';

function RootComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated (except on login page)
  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/login" />;
  }

  // Redirect to home if already authenticated and on login page
  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/" />;
  }

  return (
    <Box>
      {!isLoginPage && <AppBar />}
      <Outlet />
      <TanStackRouterDevtools />
    </Box>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
