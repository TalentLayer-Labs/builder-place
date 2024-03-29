import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useVerifyEmailMutation } from '../../../modules/BuilderPlace/hooks/UseVerifyEmailMutation';
import Loading from '../../../components/Loading';
import {
  EMAIL_ALREADY_VERIFIED,
  EMAIL_VERIFIED_SUCCESSFULLY,
} from '../../../modules/BuilderPlace/apiResponses';
import { GetServerSidePropsContext } from 'next';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

const verifyEmail = () => {
  const { mutateAsync: verifyEmailAsync } = useVerifyEmailMutation();
  const router = useRouter();
  const { query } = router;
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [pageResponse, setPageResponse] = useState('Missing Id');

  console.log('verifyEmail', { id, query });
  console.log('verifyEmail', { router });

  useEffect(() => {
    if (id) {
      verifyEmail(id as string);
    }
  }, [id]);

  const goToHomePage = () => {
    router.push('/');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const verifyEmail = async (id: string) => {
    const response = await verifyEmailAsync({
      userId: id.toString(),
    });
    if (response.error) {
      setPageResponse(response.error);
    } else {
      setPageResponse(response.message);
    }
    console.log('Response', response);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className='py-20'>
        <Loading />
      </div>
    );
  }

  return (
    <>
      {pageResponse === EMAIL_VERIFIED_SUCCESSFULLY ? (
        <div className='rounded-xl p-4 border border-info text-base-content bg-base-100'>
          <div className='max-w-7xl mx-auto text-base-content sm:px-4 lg:px-0 sm:py-20 py-10'>
            <div className='flex flex-col items-center justify-center gap-10'>
              <p className='text-5xl sm:text-7xl font-bold tracking-wider max-w-5xl text-center'>
                Congratulations! 🎉
              </p>
              <p className='text-3xl sm:text-5xl font-medium tracking-wider max-w-5xl text-center'>
                Your email is validated!
              </p>
              <button
                className='bg-pink-500 text-content rounded-lg px-4 py-2 mt-4 text-lg text-white font-medium'
                onClick={() => goToDashboard()}>
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      ) : pageResponse === EMAIL_ALREADY_VERIFIED ? (
        <div className='rounded-xl p-4 border border-info text-base-content bg-base-100'>
          <div className='max-w-7xl mx-auto text-base-content sm:px-4 lg:px-0 sm:py-20 py-10'>
            <div className='flex flex-col items-center justify-center gap-10'>
              <p className='text-5xl sm:text-7xl font-bold tracking-wider max-w-5xl text-center'>
                Email Already Verified! 🦝
              </p>
              <p className='text-xl sm:text-2xl text-base-content opacity-50 text-center'>
                Looks like you're already all set!
              </p>
              <button
                className='bg-green-500 text-content rounded-lg px-4 py-2 mt-4 text-lg text-white font-medium'
                onClick={() => goToHomePage()}>
                Explore More
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className='rounded-xl p-4 border border-info text-base-content bg-base-100'>
          <div className='max-w-7xl mx-auto text-base-content sm:px-4 lg:px-0 sm:py-20 py-10'>
            <div className='flex flex-col items-center justify-center gap-10'>
              <p className='text-5xl sm:text-7xl font-bold tracking-wider max-w-5xl text-center'>
                Oops! 😕
              </p>
              <p className='text-3xl sm:text-5xl font-medium tracking-wider max-w-5xl text-center'>
                Something went wrong...
              </p>
              <p className='text-xl sm:text-2xl text-base-content opacity-50 text-center'>
                Don't worry! We can send another validation email to get you started, just head to
                your dashboard!
              </p>
              <button
                className='bg-blue-500 text-content rounded-lg px-4 py-2 mt-4 text-lg text-white font-medium'
                onClick={() => goToDashboard()}>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default verifyEmail;
