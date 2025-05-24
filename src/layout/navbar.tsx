import {
  AccountCircle,
  Close as CloseIcon,
  Logout,
  MenuRounded,
  SearchRounded,
  ShoppingCartOutlined,
} from '@mui/icons-material';
import Profile from '@mui/icons-material/Person'; // Adjust the import path if necessary
import {
  AppBar,
  Badge,
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CurrencySelector from '~/components/CurrencySelector/CurrencySelector';
import LanguageSelection from '~/components/LanguageSelection';
import { useCountCartItems } from '~/hooks/event/useAddCart';
import { useAuthToken } from '~/hooks/useAuthToken';
import { type NavItem, navItems } from '~/layout/navItems';
import { NavbarProps } from '~/models/shop';
import { getToken } from '~/server/auth';
import { localStorageData } from '~/server/cache';
import { StyledInputBase } from '~/styles/navbar';
import theme from '~/styles/theme';

const Navbar = ({ currentPage, goToPage }: NavbarProps) => {
  const { t } = useTranslation();
  // Current Path URL
  const location = useRouterState({ select: (state) => state.location });
  const currentPath = location.pathname;
  // Do not render on login
  const shouldRender = !(
    currentPath === '/login' ||
    currentPath === '/signup' ||
    currentPath === '/forgot-password' ||
    currentPath.startsWith('/verify-email')
  );

  // ✅ Only render null AFTER hooks
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), {
    noSsr: true,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();

  // Get cart items count using TanStack Query
  const { data: countCartItems } = useCountCartItems();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const { token } = useAuthToken();

  const handleAccountClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      // Store the current target before async operation
      const currentTarget = e.currentTarget;

      // Check authentication
      const { token } = await getToken();

      if (!token || token === '') {
        navigate({ to: '/login' });
      } else {
        // Important: use the stored reference, not e.currentTarget which might be null after async
        setAnchorEl(currentTarget);
      }
    } catch (error) {
      navigate({ to: '/login' });
    }
  };

  const adjustedPage = currentPath !== '/' ? 1 : currentPage;
  const isTransparent = adjustedPage === 1;

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 'none',
          bgcolor: 'rgba(14, 24, 40, 0.9)',
          backdropFilter: 'none',
          transition: 'background-color 0.3s ease',
          borderBottom: 'none',
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ justifyContent: 'space-between', position: 'relative' }}
          >
            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMobileMenu}
              sx={{
                display: { xs: 'flex', md: 'none' },
              }}
            >
              <MenuRounded sx={{ color: 'white' }} />
            </IconButton>

            {/* Logo - Centered on Desktop */}
            <Box
              sx={{
                transform: 'translateX(-5%)',
                display: { xs: 'block', md: 'none' },
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontFamily: "'Canela Trial', serif",
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'white',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  goToPage?.(0);
                  navigate({ to: '/' });
                }}
              ></Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexGrow: 1,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 2,
                  mr: -10,
                }}
              >
                {navItems.map((item: NavItem) => {
                  return (
                    <Typography
                      key={item.name}
                      onClick={() => {
                        navigate({
                          to: item.href,
                        });
                      }}
                      sx={{
                        cursor: 'pointer',
                        mx: 1,
                        color: 'white',
                        fontWeight:
                          currentPage === item.page ||
                            (currentPath !== '/' &&
                              currentPath.split('/')[1] ===
                              item.href?.split('/')[1])
                            ? 700
                            : 400,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          width:
                            currentPage === item.page ||
                              (currentPath !== '/' &&
                                currentPath.split('/')[1] ===
                                item.href?.split('/')[1])
                              ? '100%'
                              : '0%',
                          height: '2px',
                          bottom: 0,
                          left: 0,
                          backgroundColor: 'primary.main',
                          transition: 'width 0.3s ease',
                        },
                        '&:hover::after': {
                          width: '100%',
                        },
                      }}
                    >
                      {t(item.name)}
                    </Typography>
                  );
                })}
              </Box>
            )}

            {/* Logo - Centered on Desktop */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontFamily: "'Canela Trial', serif",
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'white',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  goToPage?.(0);
                  navigate({ to: '/' });
                }}
              >
                Ewent
              </Typography>
            </Box>

            {/* Action icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Currency selector */}
              <CurrencySelector />

              {/* Search */}
              <IconButton
                color="inherit"
                onClick={toggleSearch}
                sx={{
                  mr: 0,
                }}
              >
                <SearchRounded
                  sx={{ color: 'white' }}
                />
              </IconButton>

              {/* Shopping cart */}
              {localStorageData('token').getLocalStrage() ||
                (localStorageData('customer_id').getLocalStrage() && (
                  <Link to="/shop/add-cart" style={{ textDecoration: 'none' }}>
                    <IconButton color="inherit">
                      <Badge
                        badgeContent={countCartItems}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            color: '#ffffff',
                            fontSize: '1rem',
                          },
                          ml: 1,
                        }}
                      >
                        <ShoppingCartOutlined
                          sx={{ color: 'white' }}
                        />
                      </Badge>
                    </IconButton>
                  </Link>
                ))}

              {/* User account dropdown */}
              {!isMobile && (
                <Box sx={{ position: 'relative', ml: 1, mr: 0 }}>
                  <IconButton
                    color="inherit"
                    onClick={handleAccountClick}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                  >
                    <AccountCircle
                      sx={{ color: 'white' }}
                    />
                  </IconButton>
                  <Menu
                    id="account-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={() => setAnchorEl(null)}
                    MenuListProps={{
                      'aria-labelledby': 'account-button',
                    }}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        mt: 1.5,
                        borderRadius: 2,
                        minWidth: 180,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '& .MuiMenuItem-root': {
                          py: 1.5,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        navigate({ to: '/profile' });
                      }}
                      sx={{
                        color: '#4A5568',
                        '&:hover': {
                          backgroundColor: '#F7FAFC',
                        },
                      }}
                    >
                      <Profile sx={{ mr: 1, color: '#C98B6B' }} />
                      <Typography>{t('view_profile')}</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        navigate({ to: '/logout' });
                      }}
                      sx={{
                        color: '#4A5568',
                        '&:hover': {
                          backgroundColor: '#FEF2F2',
                        },
                      }}
                    >
                      <Logout sx={{ mr: 1, color: '#E53E3E' }} />
                      <Typography>{t('logout')}</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              )}

              {/* Language change */}
              <LanguageSelection />
            </Box>
          </Toolbar>
        </Container>

        {/* Mobile drawer menu */}
        <Drawer anchor="left" open={mobileMenuOpen} onClose={toggleMobileMenu}>
          <Box sx={{ width: 250 }} role="presentation">
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}
            >
              <Typography variant="h6">Menu</Typography>
              <IconButton onClick={toggleMobileMenu}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />
            <List>
              {navItems.map((item) => {
                const isSelected =
                  currentPath === '/' && currentPage === item.page;
                const Icon = item.icon;
                return (
                  <MenuItem
                    key={item.name}
                    selected={
                      isSelected ||
                      (currentPath !== '/' &&
                        currentPath.split('/')[1] === item.href?.split('/')[1])
                    }
                    onClick={() => {
                      if (currentPath === '/') {
                        goToPage?.(item.page);
                      } else {
                        navigate({
                          to: item.href,
                        });
                      }
                      toggleMobileMenu();
                    }}
                  >
                    {Icon && (
                      <Icon
                        sx={{
                          fontSize: '1.25rem',
                          verticalAlign: 'middle',
                          mr: 1.5,
                        }}
                      />
                    )}
                    {t(item.name)}
                  </MenuItem>
                );
              })}

              {token && (
                <>
                  <MenuItem
                    onClick={() => {
                      navigate({ to: '/profile' });
                    }}
                  >
                    <Profile sx={{ mr: 1, color: '#C98B6B' }} />
                    {t('profile')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate({ to: '/logout' });
                    }}
                  >
                    <Logout sx={{ mr: 1, color: '#E53E3E' }} />
                    {t('logout')}
                  </MenuItem>
                </>
              )}
            </List>
          </Box>
        </Drawer>
      </AppBar>

      {/* Search dialog */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">{t('search')}</Typography>
            <IconButton onClick={() => setSearchOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              bgcolor: 'background.default',
              transition: 'box-shadow 0.3s ease-in-out',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            <SearchRounded sx={{ color: 'text.secondary', mr: 1 }} />
            <StyledInputBase
              placeholder={t('please_enter_search_text')}
              autoFocus
              fullWidth
              inputProps={{ 'aria-label': 'search' }}
              sx={{
                flex: 1,
              }}
            />
            <IconButton
              size="small"
              sx={{ visibility: 'hidden' }} // Change to visible when input is not empty (optional)
            // onClick={clearInputFunction}  // Add handler to clear input
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
