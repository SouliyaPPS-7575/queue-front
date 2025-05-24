import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectProps,
  type SelectChangeEvent,
} from '@mui/material';
import { forwardRef, useEffect, useState } from 'react';
import { localStorageData } from '~/server/cache';
import i18next from '~/utils/i18n';

const CustomSelect = forwardRef<HTMLDivElement, SelectProps>((props, ref) => (
  <Select {...props} ref={ref} />
));

function LanguageSelection() {
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorageData('language').getLocalStrage() || 'la';
    }
    return 'la';
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    i18next.changeLanguage(language);
  }, [language]);

  const handleLanguageChange = (e: SelectChangeEvent<unknown>) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage as string);
    if (typeof window !== 'undefined') {
      localStorageData('language').setLocalStorage(selectedLanguage as string);
    }
    i18next.changeLanguage(selectedLanguage as string);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        ml: 2,
        mr: -2,
      }}
    >
      <FormControl
        size="small"
        sx={{
          backgroundColor: 'transparent',
          borderRadius: 28,
          boxShadow: 'none',
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
      >
        <CustomSelect
          value={language}
          onChange={handleLanguageChange}
          onOpen={() => setMenuOpen(true)}
          onClose={() => setMenuOpen(false)}
          displayEmpty
          renderValue={(selected) => (
            <Box
              component="img"
              src={
                selected === 'la'
                  ? 'https://flagcdn.com/w40/la.png'
                  : 'https://flagcdn.com/w40/gb.png'
              }
              alt={selected === 'la' ? 'Lao flag' : 'English flag'}
              sx={{
                width: 21,
                height: 21,
                borderRadius: '50%',
                border: '1px solid white',
              }}
            />
          )}
          inputProps={{ 'aria-label': 'Select language' }}
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              py: 0,
              pl: 0,
              pr: 0,
            },
            backgroundColor: 'transparent',
            '& fieldset': { border: 'none' },
            fontSize: { xs: '0.875rem', sm: '0.925rem' },
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          <MenuItem
            value="la"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
          >
            <Box
              component="img"
              src="https://flagcdn.com/w40/la.png"
              alt="Lao flag"
              sx={{ width: { xs: '22px', sm: '26px' }, height: 'auto' }}
            />
            {menuOpen && <span style={{ marginLeft: '-5px' }}>ລາວ</span>}
          </MenuItem>
          <MenuItem
            value="en"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
          >
            <Box
              component="img"
              src="https://flagcdn.com/w40/gb.png"
              alt="English flag"
              sx={{ width: { xs: '22px', sm: '26px' }, height: 'auto' }}
            />
            {menuOpen && <span style={{ marginLeft: '-6px' }}>Eng</span>}
          </MenuItem>
        </CustomSelect>
      </FormControl>
    </Box>
  );
}

export default LanguageSelection;
