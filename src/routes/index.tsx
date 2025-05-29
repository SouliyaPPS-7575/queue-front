import { useRef, useState } from 'react';
import { bannersQueryOption } from '~/hooks/banner/useBanners';
import { productsQueryOption } from '~/hooks/event/useProducts';
import Navbar from '~/layout/navbar';

import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Button,
  Divider,
  Paper,
} from "@mui/material"

import { createFileRoute, Link } from '@tanstack/react-router';


import { ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";

import { ThemeProvider } from "@/components/theme-provider"
import { useEvents } from '~/hooks/event/useProducts';


export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const products = context.queryClient.ensureQueryData(productsQueryOption());
    const banners = context.queryClient.ensureQueryData(bannersQueryOption());
    return { products, banners };
  },
  component: Home,
});

// Mock data for events
const events = [
  {
    id: 1,
    title: "DevFest Vientiane 2022",
    date: "10 ສິງຫາ 2022",
    time: "09:00-16:30",
    location: "ສູນການຮຽນຮູ້ໄອຊີທີ ແລະ ບໍລິການ (ICTC)",
    image: "/placeholder.svg?height=200&width=300",
  },
]

// Mock data for past events (duplicate of events for demo)
const pastEvents = [...events]

// Mock data for categories
const categories = [
  { id: 1, name: "ທັງໝົດ", active: true },
  { id: 2, name: "ການສຶກສາ", active: false },
  { id: 3, name: "ສັມມະນາ", active: false },
  { id: 4, name: "ເທດສະການ", active: false },
  { id: 5, name: "ສິລະປະ", active: false },
  { id: 6, name: "ກິລາ", active: false },
  { id: 7, name: "ການແຂ່ງຂັນ", active: false },
  { id: 8, name: "ສະແດງ ແລະ ບັນເທີງ", active: false },
]

// Mock data for sponsors
const sponsors = [
  { id: 1, name: "Indee", logo: "/placeholder.svg?height=40&width=80" },
  { id: 2, name: "Heineken", logo: "/placeholder.svg?height=40&width=80" },
  { id: 3, name: "Bitqik", logo: "/placeholder.svg?height=40&width=80" },
  { id: 4, name: "LDB Bank", logo: "/placeholder.svg?height=40&width=80" },
  { id: 5, name: "Sponsor 5", logo: "/placeholder.svg?height=40&width=80" },
  { id: 6, name: "Sponsor 6", logo: "/placeholder.svg?height=40&width=80" },
]


function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [gridCols, setGridCols] = useState(2); // default to 2 columns

  // Handle page change
  const goToPage = (pageNumber: number) => {
    // Allow navigation state to update before scrolling
    setTimeout(() => {
      if (containerRef.current?.children[pageNumber]) {
        const element = containerRef.current.children[
          pageNumber
        ] as HTMLElement;
        element.getBoundingClientRect(); // force reflow
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  //  Handle scroll
  let lastScrollTop = 0;

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const direction = scrollTop > lastScrollTop ? 'down' : 'up';
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

    if (direction === 'down' && currentPage === 0) {
      setCurrentPage(1);
    } else if (direction === 'up' && scrollTop <= 10 && currentPage === 1) {
      setCurrentPage(0);
    }
  };

  // const theme = useTheme()
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [activeCategory, setActiveCategory] = useState(1)

  const { events } = useEvents()

  return (
    <>
      <Navbar currentPage={currentPage} goToPage={goToPage} />

      {/* Scrollable container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '100vh', // Full viewport height
          overflowY: 'auto', // Enable vertical scrolling
          scrollSnapType: 'y mandatory', // Optional if you want snap scrolling
          scrollBehavior: 'smooth',
        }}
      >

        <ThemeProvider>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1 }}>
              {/* Hero Banner */}
              <Box
                sx={{
                  position: "relative",
                  backgroundColor: "#0f172a",
                  color: "white",
                  overflow: "hidden",
                }}
              >
                <Container maxWidth="lg">

                  <Box sx={{ padding: 5 }}>
                  </Box>
                  <Box
                    sx={{
                      position: "relative",
                      height: { xs: "180px", md: "220px" },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ ml: 5, zIndex: 2, width: "100%", position: "relative" }}>
                      <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                          fontWeight: "bold",
                          fontSize: { xs: "2rem", md: "3rem" },
                        }}
                      >
                        devfest
                      </Typography>
                      <Typography variant="h5" sx={{ mt: 1 }}>
                        Vientiane
                      </Typography>

                      <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                        <Calendar size={16} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          10 ສິງຫາ 2022
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          09:00-16:30
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                        <MapPin size={16} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ສູນການຮຽນຮູ້ໄອຊີທີ ແລະ ບໍລິການ (ICTC)
                        </Typography>
                      </Box>
                    </Box>


                    <IconButton
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.5)",
                        },
                      }}
                    >
                      <ChevronLeft size={24} />
                    </IconButton>

                    <IconButton
                      sx={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.5)",
                        },
                      }}
                    >
                      <ChevronRight size={24} />
                    </IconButton>
                  </Box>
                </Container>
              </Box>

              {/* Categories */}
              <Box sx={{ backgroundColor: "#0f172a", py: 2 }}>
                <Container maxWidth="lg">
                  <Box
                    sx={{
                      display: "flex",
                      overflowX: "auto",
                      gap: 1,
                      pb: 1,
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    }}
                  >
                    {categories.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        onClick={() => setActiveCategory(category.id)}
                        sx={{
                          backgroundColor: category.id === activeCategory ? "#10b981" : "rgba(255,255,255,0.1)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: category.id === activeCategory ? "#10b981" : "rgba(255,255,255,0.2)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Container>
              </Box>

              {/* Upcoming Events */}
              <Box sx={{ backgroundColor: "#0f172a", py: 4 }}>
                <Container maxWidth="lg">
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      color: "white",
                      mb: 3,
                      fontWeight: "bold",
                    }}
                  >
                    ອີເວັ້ນຫລ້າສຸດ
                  </Typography>

                  <Grid container spacing={3}>
                    {events.map((event) => (

                      <Grid
                        key={event.id}
                        size={{
                          xs: gridCols === 1 ? 12 : 6,
                          sm: 6,
                          md: 4,
                          lg: 3,
                        }}
                      >

                        <Link
                          to="/event/view/$eventID"
                          params={{
                            eventID: event.id ?? '',
                          }}
                        >
                          <Card
                            sx={{
                              height: '100%',
                              borderRadius: 0,
                              overflow: 'hidden',
                              boxShadow: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              backgroundColor: 'transparent',
                              transition: 'all 0.3s ease',
                              p: 0,
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="140"
                              image={process.env.BASE_URL + "/api/files/events/" + event.id + "/" + event.image_url}
                              sx={{
                                aspectRatio: '4 / 5',
                                width: '100%',
                                objectFit: 'cover',
                                boxShadow: 3,
                                transition: 'transform 0.4s ease',
                                '&:hover': { transform: 'scale(1.05)' },
                              }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <Calendar size={14} color="#9ca3af" />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#9ca3af",
                                    ml: 0.5,
                                  }}
                                >
                                  {event.created}
                                </Typography>
                              </Box>

                              <Typography
                                variant="subtitle1"
                                component="h3"
                                sx={{
                                  fontWeight: "bold",
                                  mb: 1,
                                  color: "white",
                                  fontSize: "0.9rem",
                                  lineHeight: 1.3,
                                }}
                              >
                                {event.name}
                              </Typography>

                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <MapPin size={14} color="#9ca3af" />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#9ca3af",
                                    ml: 0.5,
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {event.price}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Link>
                      </Grid>
                    ))}
                  </Grid>
                </Container>
              </Box>

              {/* Past Events */}
              <Box sx={{ backgroundColor: "#0f172a", py: 4 }}>
                <Container maxWidth="lg">
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      color: "white",
                      mb: 3,
                      fontWeight: "bold",
                    }}
                  >
                    ອີເວັ້ນທີ່ຜ່ານມາແລ້ວ
                  </Typography>

                  <Grid container spacing={3}>
                    {pastEvents.map((event) => (
                      <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "#1e293b",
                            color: "white",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <CardMedia component="img" height="140" image={event.image} alt={event.title} />
                          <CardContent sx={{ flexGrow: 1, p: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <Calendar size={14} color="#9ca3af" />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#9ca3af",
                                  ml: 0.5,
                                }}
                              >
                                {event.date}
                              </Typography>
                            </Box>

                            <Typography
                              variant="subtitle1"
                              component="h3"
                              sx={{
                                fontWeight: "bold",
                                mb: 1,
                                fontSize: "0.9rem",
                                lineHeight: 1.3,
                              }}
                            >
                              {event.title}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <MapPin size={14} color="#9ca3af" />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#9ca3af",
                                  ml: 0.5,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {event.location}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 4,
                    }}
                  >
                    <Button
                      variant="outlined"
                      endIcon={<ChevronRight size={16} />}
                      sx={{
                        color: "#10b981",
                        borderColor: "#10b981",
                        "&:hover": {
                          borderColor: "#059669",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                        },
                      }}
                    >
                      ເບິ່ງເພີ່ມເຕີມ
                    </Button>
                  </Box>
                </Container>
              </Box>

              {/* Sponsors */}
              <Box sx={{ backgroundColor: "#0f172a", py: 4, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <Container maxWidth="lg">
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "white",
                      mb: 3,
                      textAlign: "center",
                    }}
                  >
                    Trusted by
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      gap: 4,
                      mb: 4,
                    }}
                  >
                    {sponsors.map((sponsor) => (
                      <Box
                        key={sponsor.id}
                        component="img"
                        src={sponsor.logo}
                        alt={sponsor.name}
                        sx={{
                          height: 40,
                          filter: "brightness(0) invert(1)",
                          opacity: 0.7,
                          transition: "opacity 0.3s",
                          "&:hover": {
                            opacity: 1,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Container>
              </Box>
            </Box>

            {/* Footer */}
            <Box
              component="footer"
              sx={{
                backgroundColor: "#10b981",
                py: 4,
                color: "#0f172a",
              }}
            >
              <Container maxWidth="lg">
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: "bold",
                        mb: 2,
                      }}
                    >
                      <Box component="span" sx={{ color: "white", mr: 0.5 }}>
                        e
                      </Box>
                      went.la
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Download the app by clicking the link below :
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 0.5,
                          px: 1,
                          display: "flex",
                          alignItems: "center",
                          borderRadius: 1,
                          backgroundColor: "#0f172a",
                        }}
                      >
                        <Box
                          component="img"
                          src="/placeholder.svg?height=24&width=24"
                          alt="Google Play"
                          sx={{ height: 24, mr: 1 }}
                        />
                        <Box>
                          <Typography variant="caption" sx={{ color: "white", display: "block", lineHeight: 1 }}>
                            GET IT ON
                          </Typography>
                          <Typography variant="body2" sx={{ color: "white", fontWeight: "bold", lineHeight: 1.2 }}>
                            Google Play
                          </Typography>
                        </Box>
                      </Paper>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 0.5,
                          px: 1,
                          display: "flex",
                          alignItems: "center",
                          borderRadius: 1,
                          backgroundColor: "#0f172a",
                        }}
                      >
                        <Box
                          component="img"
                          src="/placeholder.svg?height=24&width=24"
                          alt="App Store"
                          sx={{ height: 24, mr: 1 }}
                        />
                        <Box>
                          <Typography variant="caption" sx={{ color: "white", display: "block", lineHeight: 1 }}>
                            Download on the
                          </Typography>
                          <Typography variant="body2" sx={{ color: "white", fontWeight: "bold", lineHeight: 1.2 }}>
                            App Store
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                      Contact
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        +85620 55636450
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        UGD Media Co., Ltd. Wattnak, Sisattanak, Vientiane Capital, Laos.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.1)" }} />

                <Typography variant="caption" sx={{ display: "block", textAlign: "center" }}>
                  Copyright © 2023 Lao IT Dev Co., Ltd. All Rights Reserved
                </Typography>
              </Container>
            </Box>
          </Box>
        </ThemeProvider>

      </div>
    </>
  );
}
