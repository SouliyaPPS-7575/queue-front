import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import React from 'react';
import { useCurrency } from '~/hooks/event/useCurrency';
import { useCurrencyContext } from './CurrencyProvider';
import { useRouterState } from '@tanstack/react-router';

const CustomArrowDropDownIcon = ({ color }: { color: string }) => (
  <ArrowDropDownIcon sx={{ color, marginLeft: -9.5 }} />
);

const CustomArrowDropUpIcon = ({ color }: { color: string }) => (
  <ArrowDropUpIcon sx={{ color, marginLeft: -9.5 }} />
);

interface CurrencySelectorProps {
  showLabel?: boolean;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  minWidth?: number;
  isTransparent?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  showLabel = false,
  size = 'small',
  variant = 'outlined',
  minWidth = 80,
}) => {
  // Current Path URL
  // const location = useRouterState({ select: (state) => state.location });
  // const currentPath = location.pathname;
  // const adjustedPage =
  //   currentPath !== '/';

  const { currencies } = useCurrency(); // should be of type CurrencyItem[]

  // Inside your component:
  const { currency, setCurrency } = useCurrencyContext();

  const [open, setOpen] = React.useState(false);

  const handleCurrencyChange = (event: SelectChangeEvent) => {
    setCurrency(event.target.value);
  };

  const filteredCurrencies = React.useMemo(
    () => currencies.filter((item) => item.type === 'SELL'),
    [currencies],
  );

  const IconComponent = React.useMemo(
    () => () =>
      open ? (
        <CustomArrowDropUpIcon color={'#fff'} />
      ) : (
        <CustomArrowDropDownIcon color={'#fff'} />
      ),
    [open],
  );


  return (
    <Box display="flex" alignItems="center">
      {showLabel && (
        <Typography variant="body2" sx={{ mr: 0, color: '#7A6A55' }}>
          Currency:
        </Typography>
      )}
      <FormControl size={size} sx={{ minWidth }}>
        <Select
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          IconComponent={IconComponent}
          value={currency}
          onChange={handleCurrencyChange}
          variant={variant}
          sx={{
            cursor: 'pointer',
            '& .MuiSelect-select': {
              py: size === 'small' ? 0.5 : 1,
              px: size === 'small' ? -2 : 2,
              color: '#fff',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
          }}
        >
          {filteredCurrencies.map((currency) => (
            <MenuItem key={currency.id} value={currency.ccy}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>{currency.ccy}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CurrencySelector;
