import { IReturnPostingCondition } from '../../hooks/useCheckPostConditions';
import { ChainIdEnum, PostingCondition } from '../../modules/BuilderPlace/types';

const blockScanList = {
  [ChainIdEnum.ETHEREUM]: 'https://etherscan.io/',
  [ChainIdEnum.ARBITRUM]: 'https://https://arbiscan.io/',
  [ChainIdEnum.IEXEC]: 'https://explorer.iex.ec/bellecour/',
  [ChainIdEnum.POLYGON]: 'https://polygonscan.com/',
  [ChainIdEnum.BNB]: 'https://bscscan.com/',
};

const ConditionsStatusCard = ({ condition, validated }: IReturnPostingCondition) => {
  const getBlockExplorerLink = (chainId: ChainIdEnum, address: string, type: string) => {
    const baseLink = blockScanList[chainId];
    const path = type === 'NFT' ? 'address' : 'token';
    return `${baseLink}${path}/${address}`;
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
      const blockExplorerLink = getBlockExplorerLink(
        condition.chainId,
        condition.address,
        condition.type,
      );

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
