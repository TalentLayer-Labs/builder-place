import { useContext } from 'react';
import { formatUnits } from 'viem';
import { useChainId } from 'wagmi';
import { chains } from '../context/web3modal';
import usePlatform from '../hooks/usePlatform';
import BuilderPlaceContext from '../modules/BuilderPlace/context/BuilderPlaceContext';

function ServicePostingFee() {
  const { builderPlace } = useContext(BuilderPlaceContext);
  const chainId = useChainId();
  const platform = usePlatform(builderPlace?.talentLayerPlatformId);

  const currentChain = chains.find(chain => chain.id === chainId);
  const servicePostingFee = platform?.servicePostingFee || 0;
  const servicePostingFeeFormat = servicePostingFee
    ? Number(formatUnits(BigInt(servicePostingFee), Number(currentChain?.nativeCurrency?.decimals)))
    : 0;

  if (servicePostingFeeFormat === 0) {
    return null;
  }

  return (
    <span className='text-base-content'>
      Fee for making a service: {servicePostingFeeFormat} {currentChain?.nativeCurrency.symbol}
    </span>
  );
}

export default ServicePostingFee;
