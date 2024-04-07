import { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/markdown.css';
import dynamic from 'next/dynamic';
import { AnalyticsProvider } from './analytics-provider';
import { ReactQueryProvider } from './react-query-provider';

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
  return (
    <html lang='en'>
      <AnalyticsProvider>
        <ReactQueryProvider>
          <body>
            <PostHogPageView />
            {children}
          </body>
        </ReactQueryProvider>
      </AnalyticsProvider>
    </html>
  );
}
