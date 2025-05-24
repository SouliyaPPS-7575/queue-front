import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-phone-input-2/lib/material.css';
import { toast } from 'sonner';
import ClientOnlyPhoneInput from '~/components/ClientOnlyPhoneInput';
import LanguageSelection from '~/components/LanguageSelection';
import { SignupForm } from '~/models/auth';
import { signupServer, verifyEmailServer } from '~/server/auth';
import '~/styles/phone-input-styles.css'; // Import the custom styles

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const { mutate: createUser } = useMutation({
    mutationFn: signupServer,
    onSuccess: () => { },
  });

  const form = useForm({
    defaultValues: {
      username: '',
      phone_number: '',
      email: '',
      emailVisibility: true,
      province: '',
      district: '',
      village: '',
      password: '',
      passwordConfirm: '',
      name: '',
      // otp: '',
    } as SignupForm,
    onSubmit: async ({ value }) => {
      // Handle form submission
      createUser(
        {
          data: value,
        },
        {
          onSuccess: () => {
            verifyEmail({
              data: {
                email: value.email,
              },
            });
          },
        },
      );
    },
  });

  const { mutate: verifyEmail } = useMutation({
    mutationFn: verifyEmailServer,
    onSuccess: () => {
      navigate({
        to: '/verify-email/$email',
        params: { email: form.getFieldValue('email') },
      });
      toast.success(t('send_email_verifications'));
    },
  });
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        backgroundImage:
          "url('https://i.pinimg.com/736x/33/8d/2d/338d2d27d73882914a3c22b0f8155eca.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
          backdropFilter: 'blur(4px)',
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          px: 2,
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
          <LanguageSelection />
        </Box>
        <br />
        <Container
          maxWidth="sm"
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Card
            sx={{
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                component="h1"
                align="center"
                fontWeight="bold"
                color="primary"
                sx={{ mb: 1 }}
              >
                {t('sign_up_to_your_account')}
              </Typography>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                {/* Username Field with Material-UI styling */}
                <form.Field name="username">
                  {(field) => (
                    <TextField
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      fullWidth
                      label={t('full_name')}
                      placeholder={t('full_name')}
                      margin="normal"
                      required
                    />
                  )}
                </form.Field>

                {/* Phone Number Field with Material-UI styling */}
                <Box sx={{ my: 2 }}>
                  <form.Field name="phone_number">
                    {(field) => (
                      <Box className="phone-field-container">
                        <ClientOnlyPhoneInput
                          value={field.state.value ?? ''}
                          onChange={(phone: string) =>
                            field.handleChange(phone)
                          }
                          placeholder={t('phone_number')}
                        />
                      </Box>
                    )}
                  </form.Field>
                </Box>

                {/* Email Field */}
                <form.Field
                  name="email"
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
                      placeholder={t('password')}
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value ?? '')}
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
                                color: showPassword
                                  ? 'primary.main'
                                  : 'grey.500',
                              }}
                            >
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
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

                {/* Confirm Password */}
                <form.Field
                  name="passwordConfirm"
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
                      label={t('confirm_password')}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('confirm_password')}
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value ?? '')}
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
                              onClick={handleToggleConfirmPasswordVisibility}
                              edge="end"
                              sx={{
                                color: showConfirmPassword
                                  ? 'primary.main'
                                  : 'grey.500',
                              }}
                            >
                              {showConfirmPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
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
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    bgcolor: '#64b5f6',
                    '&:hover': {
                      bgcolor: '#42a5f5',
                    },
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {t('register')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Header with navigation options */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              background: 'transparent',
              p: 2,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ color: '#fff' }}
            >
              {t('already_have_account')}
            </Typography>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>
              {t('login')}
            </Link>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
