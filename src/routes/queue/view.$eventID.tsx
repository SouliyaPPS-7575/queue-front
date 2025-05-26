import { createFileRoute } from '@tanstack/react-router'
import { ThemeProvider, createTheme, CssBaseline, Container } from "@mui/material"

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
})


import { Card, CardContent, Typography, LinearProgress, Box, styled } from "@mui/material"
import { Person } from "@mui/icons-material"

const StyledCard = styled(Card)(({ theme }) => ({
  width: 600,
  maxWidth: 1000,
  margin: "auto",
  padding: theme.spacing(3),
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  border: "2px solid #e0e0e0",
}))

const QueueLogo = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#2e7d32",
  marginBottom: theme.spacing(3),
  fontFamily: "Arial, sans-serif",
}))

const MainHeading = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#2e7d32",
  marginBottom: theme.spacing(2),
}))

const DescriptionText = styled(Typography)(({ theme }) => ({
  fontSize: "0.95rem",
  color: "#333",
  lineHeight: 1.4,
  marginBottom: theme.spacing(3),
}))

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(4),
  backgroundColor: "#f5f5f5",
  borderRadius: 4,
  overflow: "hidden",
}))

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 40,
  backgroundColor: "#f5f5f5",
  "& .MuiLinearProgress-bar": {
    backgroundColor: "#2e7d32",
  },
}))

const ProgressIcon = styled(Person)(({ theme }) => ({
  position: "absolute",
  right: 8,
  top: "50%",
  transform: "translateY(-50%)",
  color: "white",
  fontSize: "1.5rem",
  zIndex: 1,
}))

const InfoText = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: "#333",
  marginBottom: theme.spacing(1),
  fontWeight: 500,
}))

interface QueueItCardProps {
  queueNumber?: number
  estimatedWaitTime?: string
  progress?: number
}

export const Route = createFileRoute('/queue/view/$eventID')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <QueueItCard queueNumber={8845} estimatedWaitTime="5 minutes" progress={75} />
        </Box>
      </Container>
    </ThemeProvider>
  )
}


export default function QueueItCard({
  queueNumber = 8845,
  estimatedWaitTime = "5 minutes",
  progress = 75,
}: QueueItCardProps) {
  return (
    <StyledCard>
      <CardContent>
        <QueueLogo>Queue-it</QueueLogo>

        <MainHeading>You are now in line</MainHeading>

        <DescriptionText>
          Sit tight! Your turn is almost here.
          <br />
          When it comes, you will have 10
          <br />
          min to enter the website.
        </DescriptionText>

        <ProgressContainer>
          <StyledLinearProgress variant="determinate" value={progress} />
          <ProgressIcon />
        </ProgressContainer>

        <Box>
          <InfoText>Your number in line: {queueNumber}</InfoText>
          <InfoText>Your estimated wait time: {estimatedWaitTime}</InfoText>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

