import { AppBar as MuiAppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link } from '@tanstack/react-router';

export function AppBar() {
  return (
    <MuiAppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: 2 }}>
          {/* Crossbill Icon */}
          <Box
            component="img"
            src="/icon-192.png"
            alt="Crossbill"
            sx={{
              height: 40,
              width: 40,
            }}
          />

          {/* Title */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            Crossbill
          </Typography>

          {/* Spacing to push navigation items */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Navigation Items */}
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{
              fontWeight: 500,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            Home
          </Button>
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
}
