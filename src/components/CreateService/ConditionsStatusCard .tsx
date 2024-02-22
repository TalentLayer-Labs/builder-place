import { IReturnPostingCondition } from '../../hooks/useCheckPostConditions';
import { ChainIdEnum, PostingCondition } from '../../modules/BuilderPlace/types';

//TODO write the good links
const blockScanList = {
  1: 'https://etherscan.io/',
  42161: 'https://ropsten.etherscan.io/',
  137: 'https://rinkeby.etherscan.io/',
  134: 'https://goerli.etherscan.io/',
  56: 'https://kovan.etherscan.io/',
};

const ConditionsStatusCard = ({ condition, validated }: IReturnPostingCondition) => {
  const getBlockExplorerLink = (chainId: ChainIdEnum, address: string) => {
    const baseLink = blockScanList[chainId];
    return baseLink ? `${baseLink}address/${address}` : '';
  };

  const renderConditionText = (condition: PostingCondition) => {
    switch (condition.type) {
      case 'NFT':
        return (
          <span>
            You need to own an NFT from the <strong>{condition.contractName}</strong> contract
          </span>
        );
      case 'Token':
        return (
          <span>
            You need a minimum of{' '}
            <strong>
              {condition.minimumAmount} {condition.tokenSign}
            </strong>{' '}
            from the <strong>{condition.contractName}</strong> contract
          </span>
        );
      default:
        return 'Unknown condition';
    }
  };

  const renderButton = () => {
    if (!validated) {
      const buttonText = condition.type === 'Token' ? `Buy ${condition.tokenSign}` : 'Mint NFT';
      const blockExplorerLink = getBlockExplorerLink(condition.chainId, condition.address);

      return (
        blockExplorerLink && (
          <a href={blockExplorerLink} target='_blank' rel='noopener noreferrer' className='ml-2'>
            <button className='bg-primary text-primary py-1 px-2 rounded'>{buttonText}</button>
          </a>
        )
      );
    }
    return null;
  };

  return (
    <li className='flex items-center mb-2'>
      <span className={validated ? 'text-green-500' : 'text-red-500'}>{validated ? '✓' : '✕'}</span>
      <div className='flex flex-grow items-center justify-between ml-2'>
        {renderConditionText(condition)}
        {renderButton()}
      </div>
    </li>
  );
};

export default ConditionsStatusCard;
