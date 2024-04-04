import { SearchOutline } from 'heroicons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

function SearchModal() {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleChat = () => {
    const chatLink = `/messaging/${search}`;
    router.push(chatLink);
  };

  return (
    <>
      <button
        type='button'
        className=' hover:bg-base-300 text-base-content bg-base-300 px-3 py-2 text-sm flex items-center mr-4 rounded-xl'
        onClick={() => setShow(true)}>
        <SearchOutline className='w-[18px] h-[18px] mr-2' />
        Search
      </button>

      <div
        className={`${
          !show ? 'hidden' : ''
        } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal h-full bg-black/90 flex flex-col items-center justify-center`}>
        <div className='relative w-full max-w-2xl h-auto px-4'>
          <div className='relative bg-base-300 shadow '>
            <div className='absolute top-[-30px] right-[-10px]'>
              <button
                onClick={() => setShow(false)}
                type='button'
                className='text-error bg-error hover:opacity-60 rounded-xl text-sm p-4 ml-auto inline-flex items-center '
                data-modal-toggle='defaultModal'>
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'></path>
                </svg>
                <span>Close</span>
              </button>
            </div>
            <div className='flex flex-col justify-between items-center pb-6'>
              <h3 className='text-xl font-semibold text-center py-6'>
                search by <br />
                wallet address
              </h3>
              <div className='flex justify-center'>
                <input
                  type='text'
                  name='search'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  onChange={e => {
                    setSearch(e.target.value);
                  }}
                  value={search}
                />
              </div>
              {search.length > 0 && (
                <a
                  onClick={handleChat}
                  className='flex p-3 bg-primary text-primary border-info rounded-xl justify-between mt-10 text-base-content'>
                  Chat
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchModal;
