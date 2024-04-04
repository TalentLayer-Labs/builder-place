import Link from 'next/link';

const OnboardingRedirectButton = () => {
  return (
    <div className='flex py-4 px-4 sm:px-0 justify-center items-center flex-col drop-shadow-lg rounded'>
      <div className='text-center my-6'>
        <p className='text-2xl sm:text-4xl font-bold mb-3'>Create Your Account</p>
        <p className='mb-8'>
          To access this page, you need to create an account. Your account is your gateway to
          connect and engage within our platform.
        </p>
      </div>
      <Link
        href='/newonboarding/create-profile'
        className='px-5 py-2 rounded-xl bg-primary text-primary hover:opacity-60'>
        Create an account
      </Link>
    </div>
  );
};

export default OnboardingRedirectButton;
