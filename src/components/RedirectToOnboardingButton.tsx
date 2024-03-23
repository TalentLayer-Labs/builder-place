import React from 'react';
import { useRouter } from 'next/router';

const OnboardingRedirectButton = () => {
  const router = useRouter();
  const handleRedirect = () => {
    router.push('/newonboarding/create-profile');
  };

  return (
    <div className='flex py-4 px-4 sm:px-0 justify-center items-center flex-col drop-shadow-lg rounded'>
      <div className='text-center my-6'>
        <p className='text-2xl sm:text-4xl font-bold mb-3'>Create Your Profile</p>
        <p className='mb-8'>
          To access this page, you need to create a profile. Your profile is your gateway to connect
          and engage within our platform.
        </p>
      </div>
      <button
        onClick={handleRedirect}
        className='bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded'>
        Go to Onboarding
      </button>
    </div>
  );
};

export default OnboardingRedirectButton;
