import { IReturnPostingCondition } from '../../hooks/useCheckPostConditions';
import { PostingCondition } from '../../modules/BuilderPlace/types';

const ConditionsStatusCard = ({ condition, validated }: IReturnPostingCondition) => {
  const renderConditionText = (condition: PostingCondition) => {
    switch (condition.type) {
      case 'NFT':
        return `You need to own an NFT from the contract ${condition.address}`;
      case 'Token':
        return `You need a minimum of ${condition.minimumAmount} tokens from the contract ${condition.address}`;
      default:
        return 'Unknown condition';
    }
  };

  return (
    <li className='flex items-center mb-2'>
      <span className={validated ? 'text-green-500' : 'text-red-500'}>{validated ? '✓' : '✕'}</span>
      <p className='ml-2'>{renderConditionText(condition)}</p>
    </li>
  );
};

export default ConditionsStatusCard;
