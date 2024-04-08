import { SpeedInsights } from '@vercel/speed-insights/next';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomPalette from '../components/CustomPalette';
import { TalentLayerProvider } from '../context/talentLayer';
import Web3ModalProvider from '../context/web3modal';
import { BuilderPlaceProvider } from '../modules/BuilderPlace/context/BuilderPlaceContext';
import { getSeoDefaultConfig } from '../modules/BuilderPlace/seo';
import { XmtpContextProvider } from '../modules/Messaging/context/XmtpContext';
import { MessagingProvider } from '../modules/Messaging/context/messging';
import '../styles/globals.css';
import '../styles/markdown.css';
import Layout from './Layout';
import { Analytics } from '@vercel/analytics/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { UserProvider } from '../modules/BuilderPlace/context/UserContext';

// react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

// Check that PostHog is client-side
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
    persistence: 'memory',
    property_blacklist: ['$ip'],
    // Enable debug mode in development
    loaded: posthog => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

function MyApp({ Component, pageProps }: AppProps) {
  console.log('MyApp', { pageProps });

  const router = useRouter();
  // useEffect(() => {
  //   const handleRouteChange = () => posthog.capture('$pageview');
  //   router.events.on('routeChangeComplete', handleRouteChange);

  //   return () => {
  //     router.events.off('routeChangeComplete', handleRouteChange);
  //   };
  // }, []);

  return (
    <>
      <PostHogProvider client={posthog}>
        <QueryClientProvider client={queryClient}>
          <DefaultSeo {...getSeoDefaultConfig(pageProps.builderPlace)} />
          <Web3ModalProvider>
            <BuilderPlaceProvider data={pageProps.builderPlace}>
              <UserProvider>
                <TalentLayerProvider>
                  <CustomPalette />
                  <XmtpContextProvider>
                    <MessagingProvider>
                      <Layout>
                        <Component {...pageProps} />
                      </Layout>
                    </MessagingProvider>
                  </XmtpContextProvider>
                  <ToastContainer position='bottom-right' />
                </TalentLayerProvider>
              </UserProvider>
            </BuilderPlaceProvider>
          </Web3ModalProvider>
        </QueryClientProvider>
        <SpeedInsights />
        <Analytics />
      </PostHogProvider>
    </>
  );
}

export default MyApp;
