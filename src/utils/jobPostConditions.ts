import { PublicClient } from 'viem/clients/createPublicClient';
import { createPublicClient, http } from 'viem';
import { iexec } from '../chains';
import { Chain } from 'wagmi';
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
