import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelection from '~/components/LanguageSelection';
import { useLogin } from '~/hooks/auth/useLogin';
import theme from '~/styles/theme';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  const { form } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundImage:
          "url('https://i.pinimg.com/736x/33/8d/2d/338d2d27d73882914a3c22b0f8155eca.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
          backdropFilter: 'blur(4px)',
        }}
      />
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
        <LanguageSelection />
      </Box>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              component="h1"
              align="center"
              fontWeight="bold"
              mb={4}
            >
              {t('login_to_your_account')}
            </Typography>

            <form
              id="login-form"
              onDragEnter={(e) => e.preventDefault()}
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              {/* Email Field */}
              <form.Field
                name="identity"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Email is required';
                    if (!/\S+@\S+\.\S+/.test(value))
                      return 'Invalid email address';
                  },
                }}
              >
                {(field) => (
                  <TextField
                    required
                    id={field.name}
                    name={field.name}
                    label={t('email')}
                    fullWidth
                    type="email"
                    margin="normal"
                    variant="outlined"
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={20} />
                        </InputAdornment>
                      ),
                    }}
                    helperText={
                      field.state.meta.isTouched
                        ? field.state.meta.errors
                        : undefined
                    }
                  />
                )}
              </form.Field>

              {/* Password Field */}
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    !value || value.length < 6
                      ? 'Password must be at least 6 characters'
                      : undefined,
                }}
              >
                {(field) => (
                  <TextField
                    required
                    autoComplete="new-password"
                    id={field.name}
                    name={field.name}
                    label={t('password')}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            sx={{
                              color: showPassword ? 'primary.main' : 'grey.500',
                            }}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    helperText={
                      field.state.meta.isTouched
                        ? field.state.meta.errors
                        : undefined
                    }
                  />
                )}
              </form.Field>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  mt: 2,
                  backgroundColor: '#0E1828E5', // Correct: Set background color using sx prop
                  color: 'white', // Optional: Set text color to ensure good contrast
                  '&:hover': {
                    backgroundColor: 'rgba(8,29,58,0.9)', // Optional: Add a hover effect for custom color
                  }
                }}
              >
                {t('login')}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mb: 2, mt: 1 }}>
              <Link
                to={'/forgot-password'}
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                }}
              >
                {t('forgot_password')}
              </Link>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary" mb={1}>
                {t('do_not_have_account')}
              </Typography>
              <Link
                to={'/signup'}
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                }}
              >
                {t('sign_up')}
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
