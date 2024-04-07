import { useContext } from 'react';
import { formatUnits } from 'viem';
import { useChainId } from 'wagmi';
import usePlatform from '../hooks/usePlatform';
import BuilderPlaceContext from '../modules/BuilderPlace/context/BuilderPlaceContext';
import { chains } from '../config/wagmi';

function ProposalPostingFee() {
  const { builderPlace } = useContext(BuilderPlaceContext);
  const chainId = useChainId();
  const platform = usePlatform(builderPlace?.talentLayerPlatformId);

  const currentChain = chains.find(chain => chain.id === chainId);
  const proposalPostingFee = platform?.proposalPostingFee || 0;
  const proposalPostingFeeFormat = proposalPostingFee
    ? Number(formatUnits(BigInt(proposalPostingFee), Number(currentChain?.nativeCurrency.decimals)))
    : 0;

  if (proposalPostingFeeFormat === 0) {
    return null;
  }

  return (
    <span className='text-base-content'>
      Fee for making a proposal: {proposalPostingFeeFormat} {currentChain?.nativeCurrency.symbol}
    </span>
  );
}

export default ProposalPostingFee;
