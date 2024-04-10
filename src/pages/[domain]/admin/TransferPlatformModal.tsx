import { useState } from 'react';
import PlatformTransferForm from './PlatformTransferForm';

function TransferPlatformModal() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className='block text-error bg-error hover:bg-info hover:text-base-content rounded-xl px-5 py-2.5 text-center'
        type='button'
        data-modal-toggle='defaultModal'>
        Transfer Ownership
      </button>

      <div
        className={`${
          !show ? 'hidden' : ''
        } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal h-full bg-black/75 flex flex-col items-center justify-center`}>
        <div className='relative p-4 w-full max-w-2xl h-auto'>
          <div className='relative bg-base-300 rounded-xl shadow '>
            <div className='flex justify-between items-start p-4 rounded-t border-b border-info'>
              <h3 className='text-xl font-semibold text-base-content '>Transfer Ownership</h3>
              <button
                onClick={() => setShow(false)}
                type='button'
                className='text-base-content bg-transparent hover:bg-base-200 hover:text-base-content rounded-xl text-sm p-1.5 ml-auto inline-flex items-center '
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
                <span className='sr-only'>Close modal</span>
              </button>
            </div>
            <div className='p-6 space-y-6'>
              <div className='flex-row'>
                <h4 className='mb-1 text-lg font-semibold text-base-content'>
                  ⚠️ This operation is irreversible
                </h4>
                <p className='text-base-content opacity-50 text-sm'>
                  Please input the address to which you want to transfer the ownership of this
                  platform
                </p>
              </div>
              <PlatformTransferForm callback={() => setShow(false)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransferPlatformModal;
