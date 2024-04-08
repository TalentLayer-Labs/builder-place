import { defineChain } from 'viem';
import { NetworkEnum } from './types';
import { Chain } from 'wagmi/chains';
import { polygon } from 'viem/chains';

export const iexec = defineChain({
  id: 134,
  name: 'iExec Sidechain',
  network: 'iexec',
  nativeCurrency: {
    decimals: 18,
    name: 'xRLC',
    symbol: 'xRLC',
  },
  rpcUrls: {
    default: {
      http: ['https://bellecour.iex.ec'],
    },
    public: {
      http: ['https://bellecour.iex.ec'],
    },
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://blockscout-bellecour.iex.ec/' },
  },
  testnet: false,
});

export const polygonMumbai = /*#__PURE__*/ defineChain({
  id: 80_001,
  name: 'Polygon Mumbai',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://endpoints.omniatech.io/v1/matic/mumbai/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://mumbai.polygonscan.com',
      apiUrl: 'https://api-testnet.polygonscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160,
    },
  },
  testnet: true,
});

const viemFormattedChains: {
  [networkId in NetworkEnum]?: Chain;
} = {
  [NetworkEnum.MUMBAI]: polygonMumbai,
  [NetworkEnum.POLYGON]: polygon,
  [NetworkEnum.IEXEC]: iexec,
};

export const getDefaultViemFormattedChain = (): Chain =>
  viemFormattedChains[process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as NetworkEnum] as Chain;

export const getViemFormattedChain = (networkId: NetworkEnum): Chain =>
  viemFormattedChains[networkId] || getDefaultViemFormattedChain();
