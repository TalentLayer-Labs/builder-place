import { PostingCondition } from '../../modules/BuilderPlace/types';

interface JobPostingConditionsProps {
  index: number;
  condition: PostingCondition;
  remove: (index: number) => void;
}
const JobPostingConditionCard = ({ index, condition, remove }: JobPostingConditionsProps) => {
  return (
    <div className='flex items-center mb-3 bg-white shadow-lg rounded-xl p-4' key={index}>
      <div className='flex-1'>
        {condition.type === 'NFT' ? (
          <>
            <div className='text-sm font-semibold text-gray-600'>NFT Address:</div>
            <div className='text-gray-800 mb-2'>{condition.address}</div>
            <div className='flex items-center'>
              <div className='mr-4'>
                <div className='text-sm font-semibold text-gray-600'>Chain Id:</div>
                <div className='text-gray-800'>{condition.chainId}</div>
              </div>
              <div>
                <div className='text-sm font-semibold text-gray-600'>Contract Name:</div>
                <div className='text-gray-800'>{condition.contractName}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='text-sm font-semibold text-gray-600'>Token Address:</div>
            <div className='text-gray-800 mb-2'>{condition.address}</div>
            <div className='flex items-center'>
              <div className='mr-4'>
                <div className='text-sm font-semibold text-gray-600'>Chain Id:</div>
                <div className='text-gray-800'>{condition.chainId}</div>
              </div>
              <div className='mr-4'>
                <div className='text-sm font-semibold text-gray-600'>Minimum Amount:</div>
                <div className='text-gray-800'>{condition.minimumAmount}</div>
              </div>
              <div>
                <div className='text-sm font-semibold text-gray-600'>Contract Name:</div>
                <div className='text-gray-800'>{condition.contractName}</div>
              </div>
            </div>
          </>
        )}
      </div>
      <button
        type='button'
        className='ml-4 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600'
        onClick={() => remove(index)}>
        Delete
      </button>
    </div>
  );
};

export default JobPostingConditionCard;
