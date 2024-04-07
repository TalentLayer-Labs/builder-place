import { PublicClient } from 'viem/clients/createPublicClient';
import { createPublicClient, http } from 'viem';
import { iexec } from '../chains';
import { Chain } from 'wagmi/chains';
import { JobConditionsChainIdEnum } from '../modules/BuilderPlace/types';
import { arbitrum, mainnet, opBNB, polygon } from 'viem/chains';

const viemFormattedChains: {
  [networkId in JobConditionsChainIdEnum]: Chain;
} = {
  [JobConditionsChainIdEnum.ETHEREUM]: mainnet,
  [JobConditionsChainIdEnum.ARBITRUM]: arbitrum,
  [JobConditionsChainIdEnum.IEXEC]: iexec,
  [JobConditionsChainIdEnum.POLYGON]: polygon,
  [JobConditionsChainIdEnum.BNB]: opBNB,
};

const blockScanList = {
  [JobConditionsChainIdEnum.ETHEREUM]: 'https://etherscan.io/',
  [JobConditionsChainIdEnum.ARBITRUM]: 'https://https://arbiscan.io/',
  [JobConditionsChainIdEnum.IEXEC]: 'https://explorer.iex.ec/bellecour/',
  [JobConditionsChainIdEnum.POLYGON]: 'https://polygonscan.com/',
  [JobConditionsChainIdEnum.BNB]: 'https://bscscan.com/',
};

export const generateClients = (chainIdSet: Set<number>): Map<number, PublicClient> => {
  const clients = new Map<number, PublicClient>();
  chainIdSet.forEach(chainId => {
    const publicClient = createPublicClient({
      chain: getViemFormattedChainForJobConditions(chainId),
      transport: http(),
    });
    clients.set(chainId, publicClient as PublicClient);
  });
  return clients;
};

export const getViemFormattedChainForJobConditions = (networkId: JobConditionsChainIdEnum): Chain =>
  viemFormattedChains[networkId];

export const getBlockExplorerLink = (
  chainId: JobConditionsChainIdEnum,
  address: string,
  type: string,
) => {
  const baseLink = blockScanList[chainId];
  const path = type === 'NFT' ? 'address' : 'token';
  return `${baseLink}${path}/${address}`;
};
