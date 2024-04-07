'use client';

import { useRouter } from 'next/router';
import CreateUserForm from '../../../components/onboarding/user/CreateUserForm';
import { GetServerSidePropsContext } from 'next';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}
function createProfile() {
  const serviceId = new URL(window.location.href).searchParams.get('serviceId');
  const router = useRouter();

  const onSuccess = () => {
    console.log('*DEBUG* onSuccess REDIRECT');
    serviceId ? router.push(`/work/${serviceId}`) : router.push(`/dashboard`);
  };

  return (
    <div className=''>
      <div className=''>
        <div className='pb-16 max-w-3xl transition-all duration-300 rounded-md mx-auto'>
          <div className='p-6 mx-auto'>
            <p className=' pb-5 sm:pb-10 pt-5 text-3xl sm:text-5xl font-bold mt-3 sm:mt-6 text-center'>
              Create your profile
            </p>

            <CreateUserForm onSuccess={onSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default createProfile;
