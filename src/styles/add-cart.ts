import { Box, Button, Dialog, Typography, styled } from '@mui/material';

// Styled components
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: 500,
    width: '100%',
    borderRadius: 8,
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
      height: '100%',
      maxWidth: '100%',
    },
  },
}));

export const CartItemBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

export const QuantityControl = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  borderRadius: 20,
  padding: '0 8px',
}));

export const CheckoutButton = styled(Button)(() => ({
  backgroundColor: '#c19a7e',
  color: 'white',
  borderRadius: 25,
  padding: '12px 0',
  '&:hover': {
    backgroundColor: '#a88269',
  },
}));

export const ContinueShoppingButton = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  marginTop: theme.spacing(1),
  cursor: 'pointer',
}));
