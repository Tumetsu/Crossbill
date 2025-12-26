import { Box, styled } from '@mui/material';

export const ThreeColumnLayout = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '280px 1fr 280px',
  gap: theme.spacing(4),
  alignItems: 'start',
}));
