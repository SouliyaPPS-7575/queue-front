import { Box, CircularProgress, Container } from '@mui/material';
import { keyframes, styled } from '@mui/system';

// Keyframes for animations
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
`;

const giftBob = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.05) rotate(3deg);
  }
`;

// Custom styled component for gradient spinner
const GradientSpinner = styled('div')(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  position: 'relative',
  background: 'linear-gradient(to bottom right, #F3ECD8, #F5F5F5)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: '50%',
    background: theme.palette.background.paper,
  },
  animation: `${pulse} 1.5s ease-in-out infinite`,
}));

// Styled component for the Gift3DIcon
const LoadingCircle = styled(CircularProgress)(() => ({
  position: 'absolute',
  zIndex: 10,
}));

const Loading = () => {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
      }}
    >
      {/* Centered loading circle */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        {/* Loading circles with gift icon in the middle */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Outer rotating circle with gradient border */}
          <Box
            sx={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -2,
                borderRadius: '50%',
                padding: 2,
                background:
                  'linear-gradient(to bottom right, #F3ECD8, #F5F5F5)',
                WebkitMask:
                  'linear-gradient(#F5F5F5 0 0) content-box, linear-gradient(#F5F5F5 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                animation: `${rotate} 2s linear infinite`,
              },
            }}
          />
          {/* Gift Icon positioned in the middle circle */}

          <LoadingCircle
            sx={{
              animation: `${giftBob} 2s ease-in-out infinite`,
              zIndex: 1,
              filter: 'drop-shadow(0px 0px 5px #F3ECD8)',
            }}
          />

          {/* Inner gradient circle */}
          <Box
            sx={{
              position: 'absolute',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 0 15px rgba(0,0,0,0.05)',
            }}
          >
            <GradientSpinner />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Loading;
