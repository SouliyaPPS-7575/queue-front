import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import LanguageSelection from '~/components/LanguageSelection';
import pb from '~/services/pocketbaseService';

export const Route = createFileRoute('/forgot-password')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await await pb
        .collection('customers')
        .requestPasswordReset(email);

      return response;
    },
    onSuccess: () => {
      toast.success(t('successfully'));
      navigate({ to: '/login' });
    },
  });

  const emailForm = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value.email);
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
        p: 2,
        backgroundImage:
          "url('https://i.ibb.co/DP9MrBH9/c5b8b40839de702f61d56f59461d7446a9d0f381.png')",
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
      <br />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ mb: 1, textAlign: 'center' }}>
              {t('please_enter_your_phone_number_to_receive_otp')}
            </Typography>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                emailForm.handleSubmit();
              }}
            >
              <emailForm.Field
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
              </emailForm.Field>

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
                {t('reset_password')}
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
            {t('remember_password')}
          </Typography>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>
            {t('login')}
          </Link>
        </Paper>
      </Container>
    </Box>
  );
}
