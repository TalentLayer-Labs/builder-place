import { IReturnPostingCondition } from '../../hooks/useCheckPostConditions';
import { PostingCondition } from '../../modules/BuilderPlace/types';

const ConditionsStatusCard = (returnedPostingConditions: IReturnPostingCondition) => {
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
    <div className='border border-info rounded-xl p-4 mb-6'>
      <h3 className='text-lg font-semibold mb-3'>Posting Conditions</h3>
      <ul>
        <li key={returnedPostingConditions.condition.address} className='flex items-center mb-2'>
          <span className={returnedPostingConditions.validated ? 'text-green-500' : 'text-red-500'}>
            {returnedPostingConditions.validated ? '✓' : '✕'}
          </span>
          <p className='ml-2'>{renderConditionText(returnedPostingConditions.condition)}</p>
        </li>
      </ul>
    </div>
  );
};

export default ConditionsStatusCard;
