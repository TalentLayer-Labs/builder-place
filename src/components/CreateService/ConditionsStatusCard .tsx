import { IReturnPostingCondition } from '../../hooks/useCheckPostConditions';
import { PostingCondition } from '../../modules/BuilderPlace/types';

const ConditionsStatusCard = ({ condition, validated }: IReturnPostingCondition) => {
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

  return (
    <li className='flex items-center mb-2'>
      <span className={validated ? 'text-green-500' : 'text-red-500'}>{validated ? '✓' : '✕'}</span>
      <p className='ml-2'>{renderConditionText(condition)}</p>
    </li>
  );
};

export default ConditionsStatusCard;
