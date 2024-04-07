'use client';

import { ReactNode } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { State, WagmiProvider } from 'wagmi';
import { config, projectId } from '../config/wagmi';
import { ReactQueryProvider } from './react-query';

if (!projectId) throw new Error('Project ID is not defined');

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
});

export default function Web3ModalProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </WagmiProvider>
  );
}
