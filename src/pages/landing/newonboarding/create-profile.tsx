import { useContext, useEffect } from 'react';
import CreateUserForm from '../../../components/Form/CreateUserForm';
import Loading from '../../../components/Loading';
import Header from '../../../components/onboarding/Header';
import UserContext from '../../../modules/BuilderPlace/context/UserContext';
import Steps from '../../../components/onboarding/platform/Steps';

/**
 * @note: pages should handle steps, everything else in the form. Form can be embed in a modal too for some context.
 */
function createProfile() {
  const { loading: isLoadingUser, user, address } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      console.log('*DEBUG* onLoad REDIRECT');
      // router.push('/newonboarding/create-platform');
    }
  }, [user]);

  const onSuccess = () => {
    console.log('*DEBUG* onSuccess REDIRECT');
    // router.push('/newonboarding/create-platform');
  };

  if (isLoadingUser) {
    return <Loading />;
  }

  return (
    <div className=''>
      <Header />

      <Steps currentStep={1} />
      <div className='text-stone-800'>
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
