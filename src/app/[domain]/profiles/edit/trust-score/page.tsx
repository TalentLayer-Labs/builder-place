'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';

import Layout from '../../../../../components/EditProfile/Layout';

function EditTrustScore() {
  return (
    <Layout>
      <h2 className='text-base-content text-xl font-bold text-center my-4'>Comming soon</h2>
      <div className='bg-base-200 relative flex flex-1 items-center justify-center bg-gradient-to-br p-5 shadow-xl rounded-xl'>
        <div className='relative z-20 flex flex-col gap-3'>
          <p className=''>
            <span className='text-base-content opacity-50'>
              {' '}
              Gain trust in the network
              <br />
              Certifiy your existing web3 reputation with blockchain
              <br />
              Preserve your privacy
              <br />
            </span>
          </p>
          <a
            aria-current='page'
            href='#'
            className='text-sm text-base-content opacity-50 underline-offset-4 underline'>
            {' '}
            Learn More{' '}
          </a>
        </div>
        <div className='absolute right-2 bottom-2 z-10 flex h-14 w-14 items-center justify-center text-primary'>
          <SparklesIcon width={56} height={56} />
        </div>
      </div>
    </Layout>
  );
}

export default EditTrustScore;
