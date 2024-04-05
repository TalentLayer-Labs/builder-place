import { IReturnPostingCondition } from '../../hooks/useCheckJobPostConditions';
import { PostingCondition } from '../../modules/BuilderPlace/types';
import { getBlockExplorerLink } from '../../utils/jobPostConditions';

const ConditionsStatusCard = ({ condition, validated }: IReturnPostingCondition) => {
  const renderConditionText = (condition: PostingCondition) => {
    switch (condition.type) {
      case 'NFT':
        return (
          <span>
            You need to own an NFT from the <strong>{condition.name}</strong> contract
          </span>
        );
      case 'Token':
        return (
          <span>
            You need a minimum of{' '}
            <strong>
              {condition.minimumAmount} {condition.symbol}
            </strong>{' '}
            from the <strong>{condition.name}</strong> contract
          </span>
        );
      default:
        return 'Unknown condition';
    }
  };

  const renderButton = () => {
    if (!validated) {
      const buttonText = condition.type === 'Token' ? `Buy ${condition.symbol}` : 'View NFT';
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
