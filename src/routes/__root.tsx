import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import i18next from 'i18next';
import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'sonner';
import { CurrencyProvider } from '~/components/CurrencySelector/CurrencyProvider';
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary';
import { NotFound } from '~/components/NotFound';
import PWAInstall from '~/components/PWAInstall';
import Navbar from '~/layout/navbar';
import { queryClient } from '~/services/queryClient';
import appCss from '~/styles/app.css?url';
import MuiProvider from '~/styles/ThemeProvider';
import { seo } from '~/utils/seo';
import { isDevelopment } from '~/utils/url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'E-Commerce Customer',
        description: `E-Commerce Customer`,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/images/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#F3ECD8' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  // Current Path URL
  const location = useRouterState({ select: (state) => state.location });
  const currentPath = location.pathname;

  // Check if we should show the navbar on this route
  const isPublicRoute = ['/', '/login', '/signup', '/forgot-password'].includes(
    currentPath,
  );

  return (
    <RootDocument>
      {!isPublicRoute ? (
        <>
          <Navbar />
          <Box>
            <Outlet />
          </Box>
        </>
      ) : (
        <Box>
          <Outlet />
        </Box>
      )}
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <PWAInstall />
        <HeadContent />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;700&family=Phetsarath+OT:wght@400;700&family=Poppins:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <script src="https://unpkg.com/react-phone-input-2@2.x/dist/lib.js"></script>
      </head>
      <body suppressHydrationWarning>
        <I18nextProvider i18n={i18next}>
          <QueryClientProvider client={queryClient}>
            <MuiProvider>
              <CurrencyProvider>{children}</CurrencyProvider>
              <Toaster
                visibleToasts={9}
                position="top-right"
                closeButton
                duration={3000}
                richColors
                toastOptions={{
                  duration: 3000,
                  className: 'custom-toast',
                }}
              />
              {isDevelopment && (
                <TanStackRouterDevtools position="bottom-right" />
              )}
              <ReactQueryDevtools buttonPosition="bottom-left" />
            </MuiProvider>
          </QueryClientProvider>
        </I18nextProvider>
        <Scripts />
      </body>
    </html>
  );
}
