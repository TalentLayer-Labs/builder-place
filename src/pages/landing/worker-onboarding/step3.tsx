import WorkerOnboardSuccess from '../../../components/WorkerOnboardSuccess';
import { useContext, useState } from 'react';
import TalentLayerContext from '../../../context/talentLayer';
import { useChainId, useWalletClient } from 'wagmi';
import OnboardingSteps from '../../../components/OnboardingSteps';
import { verifyAccount } from '../../../modules/BuilderPlace/request';
import { showErrorTransactionToast } from '../../../utils/toast';
import Loading from '../../../components/Loading';

function onboardingStep3() {
  const { account, workerProfile, loading, refreshWorkerProfile } = useContext(TalentLayerContext);
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSignMessage = async () => {
    if (walletClient && account?.address && workerProfile?.id) {
      try {
        setSubmitting(true);
        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          account: account.address,
          message: workerProfile.id.toString(),
        });

        const resp = await verifyAccount(workerProfile.id.toString(), signature);

        if (resp.error) {
          throw new Error(resp.error);
        }
      } catch (error: any) {
        showErrorTransactionToast(error.message);
      } finally {
        setSubmitting(false);
        refreshWorkerProfile();
      }
    }
  };

  return (
    <>
      {workerProfile?.status === 'VALIDATED' ? (
        <WorkerOnboardSuccess />
      ) : (
        <div>
          {loading && <Loading />}
          <OnboardingSteps currentStep={3} type='worker' />
          <div className='max-w-7xl mx-auto text-base-content sm:px-4 lg:px-0 py-20'>
            <div className='flex flex-col items-center justify-center gap-10'>
              <p className='text-5xl sm:text-7xl font-bold tracking-wider max-w-5xl text-center'>
                Almost there !
              </p>
              <p className='text-3xl sm:text-5xl font-medium tracking-wider max-w-5xl text-center'>
                Congrats on creating your profile!
              </p>
              <p className='text-xl sm:text-2xl text-base-content opacity-50 text-center'>
                One last step to validate your account, verify your eth address by signing a
                transaction.
              </p>
              <button
                disabled={isSubmitting}
                className={`${
                  isSubmitting && 'opacity-50'
                } bg-pink-500 text-content rounded-lg px-4 py-2 mt-4 text-lg text-white font-medium`}
                onClick={() => handleSignMessage()}>
                {isSubmitting ? 'Loading...' : 'Sign message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default onboardingStep3;
