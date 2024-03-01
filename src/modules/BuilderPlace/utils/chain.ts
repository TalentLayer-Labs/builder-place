import { JobConditionsChainIdEnum } from '../types';
import { arbitrum, mainnet, opBNB, polygon } from 'viem/chains';
import { iexec } from '../../../chains';

const chains: { [networkId in JobConditionsChainIdEnum]?: any } = {
  [JobConditionsChainIdEnum.ETHEREUM]: mainnet,
  [JobConditionsChainIdEnum.ARBITRUM]: arbitrum,
  [JobConditionsChainIdEnum.IEXEC]: iexec,
  [JobConditionsChainIdEnum.POLYGON]: polygon,
  [JobConditionsChainIdEnum.BNB]: opBNB,
};
export const getChainData = (networkId: JobConditionsChainIdEnum): any => chains[networkId];
