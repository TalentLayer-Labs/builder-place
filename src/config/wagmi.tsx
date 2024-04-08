import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';

import { cookieStorage, createStorage } from 'wagmi';
import { Chain, polygon } from 'wagmi/chains';
import { iexec, polygonMumbai } from '../chains';
import { NetworkEnum } from '../types';

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID;

if (!projectId) throw new Error('Project ID is not defined');

const metadata = {
  name: 'BuilderPlace',
  description: 'grow your open-source movement today',
  url: 'https://builder.place',
  icons: ['https://builder.place/logo192.png'],
};

// Create wagmiConfig
export let chains: Chain[] = [];
if ((process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as NetworkEnum) == NetworkEnum.MUMBAI) {
  chains.push(polygonMumbai);
} else if (
  (process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as NetworkEnum) == NetworkEnum.POLYGON
) {
  chains.push(polygon);
}

if (process.env.NEXT_PUBLIC_EMAIL_MODE == 'web3') {
  chains.push(iexec);
}

export const config = defaultWagmiConfig({
  // @ts-ignore
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  //   ...wagmiOptions, // Optional - Override createConfig parameters
});
