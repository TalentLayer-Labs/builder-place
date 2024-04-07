import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';
import { AnalyticsProvider } from '../context/analytics';
import Web3ModalProvider from '../context/web3modal';
import '../styles/globals.css';
import '../styles/markdown.css';
import { config } from '../config/wagmi';

// @TODO: make Metadata dynamic by builderPlace
export const metadata: Metadata = {
  title: 'BuilderPlace',
  applicationName: 'BuilderPlace',
  description: 'Empower opens-source contributors to help you achieve your goals',
  icons: { icon: '/logo512.png', apple: '/images/apple-touch-icon.png' },
  manifest: '/manifest.json',
  themeColor: '#11112a',
  appleWebApp: true,
};

const PostHogPageView = dynamic(() => import('../components/PostHogPageView'), {
  ssr: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialState = cookieToInitialState(config, headers().get('cookie'));

  return (
    <html lang='en'>
      <body>
        <AnalyticsProvider>
          <Web3ModalProvider initialState={initialState}>
            <PostHogPageView />
            {children}
          </Web3ModalProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
