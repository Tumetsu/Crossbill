import { AppBar as MuiAppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link } from '@tanstack/react-router';

export function AppBar() {
  return (
    <MuiAppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: 'primary.main',
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: 2 }}>
          {/* Crossbill Icon and Title - Clickable */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            <Box
              component="img"
              src="/icon-192.png"
              alt="Crossbill"
              sx={{
                height: 40,
                width: 40,
              }}
            />

            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'primary.contrastText',
              }}
            >
              Crossbill
            </Typography>
          </Box>

          {/* Navigation Items */}
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{
              fontWeight: 500,
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
