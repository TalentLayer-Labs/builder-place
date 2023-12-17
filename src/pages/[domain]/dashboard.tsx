import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useContext, useState } from 'react';
import Notification from '../../components/Notification';
import Steps from '../../components/Steps';
import UserDetail from '../../components/UserDetail';
import UserGains from '../../components/UserGains';
import UserPayments from '../../components/UserPayments';
import UserProposals from '../../components/UserProposals';
import UserServices from '../../components/UserServices';
import TalentLayerContext from '../../context/talentLayer';
import BuilderPlaceContext from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import { sharedGetServerSideProps } from '../../utils/sharedGetServerSideProps';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useChainId } from '../../hooks/useChainId';
import {
  createMultiStepsTransactionToast,
  showMongoErrorTransactionToast,
} from '../../utils/toast';
import { verifyEmail } from '../../modules/BuilderPlace/request';
import EmailModal from '../../components/Modal/EmailModal';
import { useRouter } from 'next/router';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function Dashboard() {
  const { account, user, talentLayerClient, workerData, refreshWorkerData } =
    useContext(TalentLayerContext);
  const router = useRouter();
  const { isBuilderPlaceOwner, builderPlace } = useContext(BuilderPlaceContext);
  const chainId = useChainId();
  const isComingFromOnboarding = router.asPath.includes('onboarding') && isBuilderPlaceOwner;

  const [show, setShow] = useState(false);

  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const delegateAddress = process.env.NEXT_PUBLIC_DELEGATE_ADDRESS as string;

  const onAddMail = async () => {
    setShow(true);
  };

  const onVerifyMail = async () => {
    if (workerData?.email && !workerData.emailVerified && user?.id) {
      try {
        const response = await verifyEmail(workerData.email, user.id);
        console.log('response', response);
      } catch (e) {
        console.log('Error', e);
        showMongoErrorTransactionToast(e);
      }
      await refreshWorkerData();
    }
  };

  const onActivateDelegation = async () => {
    if (talentLayerClient && walletClient) {
      const { request } = await publicClient.simulateContract({
        address: talentLayerClient.config.contracts.talentLayerId.address,
        abi: talentLayerClient.config.contracts.talentLayerId.abi,
        functionName: 'addDelegate',
        args: [user?.id, delegateAddress],
        account: account?.address,
      });
      const tx = await walletClient.writeContract(request);
      const toastMessages = {
        pending: 'Submitting the delegation...',
        success: 'Congrats! the delegation is active',
        error: 'An error occurred while delegation process',
      };
      await createMultiStepsTransactionToast(
        chainId,
        toastMessages,
        publicClient,
        tx,
        'Delegation',
      );
    }
  };

  if (!user) {
    return (
      <>
        {isComingFromOnboarding ? (
          <div className='max-w-7xl mx-auto text-base-content text-center'>
            <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
              <div className='py-2 px-6 sm:px-0 w-full mb-8'>
                <p className='text-2xl font-bold flex-1 mt-6'>
                  <span className='text-base-content ml-1'> your new Builder Place is ready!</span>
                </p>
                <p>Please connect your wallet to your new custom domain to access your dashboard</p>
              </div>
            </div>
          </div>
        ) : (
          <div className='max-w-7xl mx-auto text-base-content text-center'>
            <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
              <div className='py-2 px-6 sm:px-0 w-full mb-8'>
                <p className='text-2xl font-bold flex-1 mt-6'>
                  <span className='text-base-content ml-1'> Connect your wallet </span>
                </p>
                <p>You need first to connect your wallet to access your dashboard</p>
              </div>
            </div>
          </div>
        )}

        <Steps />
      </>
    );
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
        <div className='flex py-2 px-6 sm:px-0 items-center w-full mb-8'>
          <p className='text-2xl font-bold flex-1 mt-6'>
            <span className='text-base-content ml-1'> dashboard </span>
          </p>
        </div>
      </div>

      {account?.isConnected && user && (
        <div>
          {isBuilderPlaceOwner && (!builderPlace?.logo || !builderPlace?.icon) && (
            <>
              <div className='mb-12'>
                <h2 className='pb-4 text-base-content break-all flex justify-between items-center'>
                  <span className='flex-1 font-bold'>your BuilderPlace</span>
                </h2>

                <Notification
                  title='personalize your space!'
                  text='customize your BuilderPlace to match your brand'
                  link='/admin/configure-place'
                  linkText='personalize my space'
                  color='success'
                  imageUrl={user?.description?.image_url}
                />
              </div>

              <div className='mb-12'>
                <UserServices user={user} type='buyer' />
              </div>
            </>
          )}
          {!isBuilderPlaceOwner && (
            <>
              <EmailModal show={show} setShow={setShow} />
              {!workerData?.emailVerified && (
                <Notification
                  title='Verify your email !'
                  text='Tired of paying gas fees ? Verify your email and get gassless transactions !'
                  link=''
                  linkText={workerData?.email ? 'Verify my email' : 'Add my email'}
                  color='success'
                  imageUrl={user?.description?.image_url}
                  callback={workerData?.email ? onVerifyMail : onAddMail}
                />
              )}
              {workerData?.emailVerified &&
                !user.delegates?.includes(delegateAddress.toLowerCase()) && (
                  <Notification
                    title='Activate Gasless Transactions'
                    text='You can now activate gassless transactions'
                    link=''
                    linkText='Activate Gassless'
                    color='success'
                    imageUrl={user?.description?.image_url}
                    callback={onActivateDelegation}
                  />
                )}
              <div className='mb-12 mt-2'>
                <h2 className='pb-4 text-base-content  break-all flex justify-between items-center'>
                  <span className='flex-1 font-bold'>contributor profile</span>
                  <Link
                    className='hover:opacity-70 text-primary bg-primary px-3 py-2 text-sm  rounded-xl'
                    href={`/profiles/edit`}>
                    Edit
                  </Link>
                </h2>
                <UserDetail user={user} />
              </div>
              <div className='mb-12'>
                <UserPayments user={user} />
              </div>
              <div className='mb-12'>
                <UserGains user={user} />
              </div>
              <div className='mb-12'>
                <UserServices user={user} type='seller' />
              </div>
              <div className='mb-12'>
                <UserProposals user={user} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
