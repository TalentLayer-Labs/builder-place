import AsyncButton from '../../AsyncButton';
import { useState } from 'react';
import { useRouter } from 'next/router';

const AlreadyOwnsPlatform = ({ domain, logo }: { domain?: string; logo?: string | null }) => {
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  const onRedirect = async () => {
    setRedirecting(true);
    try {
      await router.push(`${window.location.protocol}//${domain}`);
    } catch (error: any) {
      console.error('Error redirecting', error);
      setRedirecting(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center text-base-content text-primary'>
      <div className='rounded-lg pb-5 max-w-md text-center'>
        <p className='text-lg mb-4'>
          You already own <strong>{domain}</strong>
        </p>
        {logo && (
          <div className='mb-4'>
            <img
              src={logo}
              alt='Platform Logo'
              className='mx-auto h-20 w-20 object-cover rounded-full border-2'
            />
          </div>
        )}
        <div className='w-full flex justify-center'>
          <AsyncButton
            isSubmitting={redirecting}
            disabled={redirecting}
            validateButtonCss={
              'rounded-md bg-info px-3.5 py-2.5 text-sm font-semibold text-base-content shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
            }
            loadingButtonCss={
              'opacity-50 rounded-md bg-info px-3.5 py-2.5 text-sm font-semibold text-base-content shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
            }
            label={'Go to My Domain'}
            onClick={onRedirect}
          />
        </div>
      </div>
    </div>
  );
};

export default AlreadyOwnsPlatform;
