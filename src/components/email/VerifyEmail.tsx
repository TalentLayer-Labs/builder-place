import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import UserContext from '../../modules/BuilderPlace/context/UserContext';
import { useMutation } from 'react-query';
import { IVerifyEmail } from '../../app/api/emails/verify/route';
import axios, { AxiosResponse } from 'axios';
import Loading from '../Loading';
import {
  EMAIL_ALREADY_VERIFIED,
  EMAIL_VERIFIED_SUCCESSFULLY,
} from '../../modules/BuilderPlace/apiResponses';

const verifyEmail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [pageResponse, setPageResponse] = useState('Missing Id');
  const emailMutation = useMutation(
    async (body: IVerifyEmail): Promise<AxiosResponse<{ id: string; message: string }>> => {
      return await axios.post('/api/emails/verify', body);
    },
  );

  const domain = window.location.hostname + ':' + window.location.port;
  const isOnRootDomain = domain === process.env.NEXT_PUBLIC_ROOT_DOMAIN;

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
    try {
      const response = await emailMutation.mutateAsync({
        emailVerificationHash: id,
      });
      setPageResponse(response?.data.message);
    } catch (error: any) {
      console.error('Error verifying email', error);
      setPageResponse(error.response.data.error);
    } finally {
      await getUser();
      setLoading(false);
    }
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
              {!isOnRootDomain && (
                <button
                  className='bg-pink-500 text-content rounded-lg px-4 py-2 mt-4 text-lg text-white font-medium'
                  onClick={() => goToDashboard()}>
                  Go to dashboard
                </button>
              )}
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
              {!isOnRootDomain && (
                <button
                  className='bg-green-500 text-content rounded-lg px-4 py-2 mt-4 text-lg text-white font-medium'
                  onClick={() => goToHomePage()}>
                  Explore More
                </button>
              )}
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
