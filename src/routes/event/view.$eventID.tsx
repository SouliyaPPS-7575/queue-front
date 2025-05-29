
import { Box, Card, CardContent, Typography, Button, Chip, Stack, Container, Grid } from "@mui/material"
import { CalendarToday, LocationOn, AttachMoney, People } from "@mui/icons-material"

import { createFileRoute, Link } from '@tanstack/react-router';
import { useViewDetails } from "~/hooks/event/useViewDetails";


export const Route = createFileRoute('/event/view/$eventID')({
  component: RouteComponent,
})


interface Event {
  collectionId: string;
  collectionName: string;
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string[];
  created: string;
  updated: string;
}


function RouteComponent() {

  const { event }: { event: Event } = useViewDetails()


  if (!event) {
    return (
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", py: 4 }}>
        <Container maxWidth="lg">
          <p>Loading event details...</p>
        </Container>
      </Box>
    );
  }

  const baseUrl = process.env.BASE_URL

  const imageSrc =
    `${baseUrl}/api/files/events/${event.id}/` +
    (event.image_url?.[0] || '');

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" mt={10}>
          {/* Concert Poster */}
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src={imageSrc}
              alt="Rock x Rap Concert Poster"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            />
          </Grid>

          {/* Event Details */}
          <Grid item xs={12} md={7}>
            <Card
              sx={{
                backgroundColor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Event Category */}
                <Chip
                  label="ຄອນເສີດ"
                  sx={{
                    mb: 2,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: "0.75rem",
                  }}
                />

                {/* Event Title */}
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    mb: 3,
                    fontSize: { xs: "2rem", md: "2.5rem" },
                  }}
                >
                  Rock x Rap Concert
                </Typography>

                {/* Event Details */}
                <Stack spacing={2} sx={{ mb: 4 }}>
                  {/* Date & Time */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CalendarToday sx={{ color: "rgba(255,255,255,0.7)" }} />
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>ວັນເວລາ</Typography>
                      <Typography sx={{ color: "white", fontWeight: 500 }}>{event.entance_date}</Typography>
                    </Box>
                  </Box>

                  {/* Location */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <LocationOn sx={{ color: "rgba(255,255,255,0.7)" }} />
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>ສະຖານທີ</Typography>
                      <Typography sx={{ color: "white", fontWeight: 500 }}>{event.location}</Typography>
                    </Box>
                  </Box>
                </Stack>

                {/* Price and Attendees */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <AttachMoney sx={{ color: "rgba(255,255,255,0.7)", fontSize: "1.2rem" }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>ລາຄາ</Typography>
                      </Box>
                      <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>
                        {event.price} ฿
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <People sx={{ color: "rgba(255,255,255,0.7)", fontSize: "1.2rem" }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>ຜູ້ເຂົ້າຮ່ວມ</Typography>
                      </Box>
                      <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>6</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Join Button */}

                <Link
                  to="/queue/view/$eventID"
                  params={{
                    eventID: event.id ?? '',
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "#4ade80",
                      color: "white",
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "#22c55e",
                      },
                    }}
                  >
                    ຊື້ບັດ
                  </Button>

                </Link>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sponsors Section */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3, fontSize: "1.1rem" }}>Sponsored by</Typography>
          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            alignItems="center"
            sx={{ flexWrap: "wrap", gap: 3 }}
          >
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                p: 2,
                borderRadius: 2,
                minWidth: 120,
              }}
            >
              <Typography sx={{ color: "#22c55e", fontWeight: "bold", fontSize: "1.2rem" }}>Heineken</Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                p: 2,
                borderRadius: 2,
                minWidth: 120,
              }}
            >
              <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "0.9rem" }}>SOUND SYSTEM</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Bottom Branding */}
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography
            variant="h2"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: { xs: "3rem", md: "4rem" },
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}


