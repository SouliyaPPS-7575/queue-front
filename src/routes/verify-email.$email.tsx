import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import LanguageSelection from '~/components/LanguageSelection';
import { VerifyEmail } from '~/models/auth';
import { verifyEmailServer } from '~/server/auth';
import pb from '~/services/pocketbaseService';

export const Route = createFileRoute('/verify-email/$email')({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { email } = Route.useParams();

  const {
    data: verify,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['verifyEmail'],
    queryFn: async () => {
      return (await pb.collection('customers').getFullList({
        filter: `email="${email}"`,
      })) as VerifyEmail[];
    },
    staleTime: 1,
  });

  useEffect(() => {
    if (verify?.[0]?.verified === false) {
      window.open('https://mail.google.com/mail/u/1/#inbox', '_blank');
    }
  }, [verify]);

  useEffect(() => {
    if (verify?.[0]?.verified === true) {
      navigate({ to: '/login' });
    }
  }, [verify]);

  const { mutate: verifyEmail } = useMutation({
    mutationFn: verifyEmailServer,
    onSuccess: () => {
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
          "url('https://i.ibb.co/DP9MrBH9/c5b8b40839de702f61d56f59461d7446a9d0f381.png')",
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
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
              {t('verify_email')}
            </Typography>

            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  my: 4,
                }}
              >
                <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="body1">
                  {t('verifying_your_email_address')}
                </Typography>
              </Box>
            )}

            {verify?.[0]?.verified === true && (
              <Stack spacing={3} alignItems="center">
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />
                <Alert severity="success" sx={{ width: '100%' }}>
                  {t('your_email_successfully_verified')}
                </Alert>
                <Typography variant="body1" textAlign="center">
                  {t('thank_you_verifying_your_email')}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  href="/login"
                  sx={{ mt: 2 }}
                >
                  {t('go_login')}
                </Button>
              </Stack>
            )}

            {verify?.[0]?.verified === false && (
              <>
                <Stack spacing={3} alignItems="center">
                  <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
                  <Alert severity="error" sx={{ width: '100%' }}>
                    {t('still_not_verify_email')}
                  </Alert>
                  <Typography
                    variant="body1"
                    textAlign="center"
                    sx={{ fontSize: 18 }}
                  >
                    {t('please_verify_email')}
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ mb: 2 }}
                      onClick={() => {
                        verifyEmail({
                          data: {
                            email,
                          },
                        });
                      }}
                    >
                      {t('resend_verification_email')}
                    </Button>
                    <Link href="/contact" underline="hover">
                      {t('need_help_contact_support')}
                    </Link>
                  </Box>
                </Stack>
              </>
            )}

            {verify?.[0]?.verified === undefined && (
              <Stack spacing={3} alignItems="center">
                <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
                <Alert severity="error" sx={{ width: '100%' }}>
                  {t('verification_failed')}
                </Alert>
                <Typography variant="body1" textAlign="center">
                  {t('we_not_verify_email')}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mb: 2 }}
                    onClick={() => {
                      navigate({ to: '/signup' });
                    }}
                  >
                    {t('back_signup')}
                  </Button>
                  <Link href="/contact" underline="hover">
                    {t('need_help_contact_support')}
                  </Link>
                </Box>
              </Stack>
            )}

            {isError && (
              <Stack spacing={3} alignItems="center">
                <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error.message} {t('verification_failed')}
                </Alert>
                <Typography variant="body1" textAlign="center">
                  {t('we_not_verify_email')}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mb: 2 }}
                    onClick={() => {
                      navigate({ to: '/signup' });
                    }}
                  >
                    {t('back_signup')}
                  </Button>
                  <Link href="/contact" underline="hover">
                    {t('need_help_contact_support')}
                  </Link>
                </Box>
              </Stack>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
