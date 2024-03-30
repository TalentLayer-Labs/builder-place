import { PostingCondition } from '../../modules/BuilderPlace/types';
import { truncateAddress } from '../../utils';
import { getBlockExplorerLink } from '../../utils/jobPostConditions';

interface JobPostingConditionsProps {
  index: number;
  condition: PostingCondition;
  remove: (index: number) => void;
}
const JobPostingConditionCard = ({ index, condition, remove }: JobPostingConditionsProps) => {
  const blockExplorerLink = getBlockExplorerLink(
    condition.chainId,
    condition.address,
    condition.type,
  );

  return (
    <div
      className='flex items-center mb-3 text-base-content bg-base-100 shadow-lg rounded-xl p-4'
      key={index}>
      <div className='flex-1'>
        {condition.type === 'NFT' ? (
          <>
            <div className='text-sm font-semibold '>NFT Address:</div>
            <div className='opacity-80 mb-2'>
              <a target='_blank' href={blockExplorerLink} className='underline'>
                {truncateAddress(condition.address)}
              </a>
            </div>
            <div className='flex items-center'>
              <div className='mr-4'>
                <div className='text-sm font-semibold '>Chain Id:</div>
                <div className='opacity-80'>{condition.chainId}</div>
              </div>
              <div>
                <div className='text-sm font-semibold '>Contract Name:</div>
                <div className='opacity-80'>{condition.name}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='text-sm font-semibold '>Token Address:</div>
            <div className='opacity-80 mb-2'>{truncateAddress(condition.address)}</div>
            <div className='flex items-center'>
              <div className='mr-4'>
                <div className='text-sm font-semibold '>Chain Id:</div>
                <div className='opacity-80'>{condition.chainId}</div>
              </div>
              <div className='mr-4'>
                <div className='text-sm font-semibold '>Contract Name:</div>
                <div className='opacity-80'>{condition.name}</div>
              </div>
              <div>
                <div className='text-sm font-semibold text-gray-600'>Minimum Amount:</div>
                <div className='text-gray-800'>{condition.minimumAmount}</div>
              </div>
            </div>
          </>
        )}
      </div>
      <button
        type='button'
        className='ml-4 px-4 py-2 rounded-xl bg-error text-error hover:opacity-80'
        onClick={() => remove(index)}>
        Delete
      </button>
    </div>
  );
};

export default JobPostingConditionCard;
