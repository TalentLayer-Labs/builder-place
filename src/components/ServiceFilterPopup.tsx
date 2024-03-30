import React from 'react';
import useAllowedTokens from '../hooks/useAllowedTokens';
import { IToken } from '../types';

interface ServiceFilterPopupProps {
  filters: {
    minRate: string;
    maxRate: string;
    selectedToken: string;
    selectedRatings: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    minRate: string;
    maxRate: string;
    selectedToken: string;
    selectedRatings: string[];
  }>>;
  handleResetFilter: () => void;
}

function ServiceFilterPopup({ filters, setFilters, handleResetFilter }: ServiceFilterPopupProps) {
  const allowedTokens = useAllowedTokens();

  const handleReset = () => {
    handleResetFilter();
  };

  return (
    <div className='absolute bg-base-200 border border-3 border-gray-300 text-base-content p-4 shadow-lg rounded-lg mt-2 ml-2 right-0 z-50'>
      <div className='flex flex-col'>
        {/* <label className='text-sm mt-1 font-bold'>Rate</label>
        <div className='flex flex-row gap-2'>
          <input
            type='number'
            value={minRate}
            onChange={e => setMinRate(e.target.value)}
            className='border border-3 border-gray-300 p-2 rounded w-24'
            placeholder='Min'
          />
          <input
            type='number'
            value={maxRate}
            onChange={e => setMaxRate(e.target.value)}
            className='border border-3 border-gray-300 p-2 rounded w-24'
            placeholder='Max'
          />
        </div> */}
        <label className='text-sm mt-3 font-bold'>Token</label>
        <div className='flex flex-col'>
          {allowedTokens.map((token: IToken) => (
            <div className='flex items-center gap-2' key={token.address}>
              <input
                type='radio'
                name='token'
                value={token.address}
                checked={filters.selectedToken === token.address}
                onChange={() => {
                  setFilters({ ...filters, selectedToken: token.address });
                }}
              />
              <label>{token.symbol}</label>
            </div>
          ))}
        </div>
        {/* <label className='text-sm mt-3 font-bold'>Rating</label>
        <div className='flex flex-col'>
          {Array.from({ length: 5 }, (_, i) => i + 1).map((rating, i) => (
            <div className='flex items-center gap-2' key={i}>
              <input
                type='checkbox'
                value={rating.toString()}
                checked={selectedRatings.includes(rating.toString())}
                onChange={e => {
                  const rating = e.target.value;
                  setSelectedRatings(prevState =>
                    prevState.includes(rating)
                      ? prevState.filter(r => r !== rating)
                      : [...prevState, rating],
                  );
                }}
              />
              <label>
                {rating} star{rating == 1 ? '' : 's'}
              </label>
            </div>
          ))}
        </div> */}
      </div>
      <div className='mt-4'>
        <button className='px-5 py-2 border border-black rounded-lg' onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default ServiceFilterPopup;
