import { Email, YouTube } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Facebook } from 'lucide-react';

function Footer() {
  return (
    <>
      {/* Green top border */}
      <Box
        sx={{ bgcolor: '#E8D9B1', height: '100px', width: '100%', zIndex: 1 }}
      />
      {/* Main content with white background */}
      <Box sx={{ bgcolor: 'white', color: '#333', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* Logo Column */}
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: '#000' }}
              >
                Logo
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#333', lineHeight: 1.6 }}
              >
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <IconButton sx={{ color: '#E8D9B1', p: 0 }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ color: '#E8D9B1', p: 0 }}>
                  <YouTube />
                </IconButton>
                <IconButton sx={{ color: '#E8D9B1', p: 0 }}>
                  <Email />
                </IconButton>
              </Box>
            </Grid>

            {/* Contact Column */}
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: '#000' }}
              >
                Contact
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mb: 1.5 }}>
                020 123 456 78
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mb: 1.5 }}>
                example@gmail.com
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mb: 1.5 }}>
                Live Chat
              </Typography>
              <Typography variant="body2" sx={{ color: '#333' }}>
                Village, District, Province
              </Typography>
            </Grid>

            {/* Navigation Column */}
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: '#000' }}
              >
                Navigation
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mb: 1.5 }}>
                Home
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mb: 1.5 }}>
                Event
              </Typography>
              <Typography variant="body2" sx={{ color: '#333' }}>
                Service
              </Typography>
            </Grid>

            {/* Join Us Column */}
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: '#000' }}
              >
                Join us
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mb: 2 }}>
                Be the first to recieve news & update
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  placeholder="Enter your email address"
                  variant="outlined"
                  size="small"
                  sx={{
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: 'transparent',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'transparent',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#c19a6b',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#a88659',
                    },
                    alignSelf: 'flex-start',
                    borderRadius: 1,
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Green bottom border with copyright */}
      <Box sx={{ bgcolor: '#E8D9B1', py: 3 }}>
        <Typography
          variant="body2"
          sx={{ color: '#000', opacity: 0.9, textAlign: 'center' }}
        >
          © 2025 Copyright Company Brand. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}

export default Footer;
