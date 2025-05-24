import { Link } from '@tanstack/react-router';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function NotFound({ children }: { children?: string }) {
  const { t } = useTranslation();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
      p={3}
    >
      <Typography variant="h4" color="textSecondary" gutterBottom>
        {children || t('page_does_not_exist')}
      </Typography>
      <Stack direction="row" spacing={2} mt={2}>
        <Button
          variant="contained"
          color="success"
          onClick={() => window.history.back()}
        >
          {t('go_back')}
        </Button>
        <Button component={Link} to="/" variant="contained" color="primary">
          {t('start_over')}
        </Button>
      </Stack>
    </Box>
  );
}
