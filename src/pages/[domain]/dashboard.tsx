import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';
import ConnectBlock from '../../components/ConnectBlock';
import DelegationNotification from '../../components/DelegationNotification';
import Notification from '../../components/Notification';
import Steps from '../../components/Steps';
import UserDetail from '../../components/UserDetail';
import UserGains from '../../components/UserGains';
import UserPayments from '../../components/UserPayments';
import UserProposals from '../../components/UserProposals';
import UserServices from '../../components/UserServices';
import VerifyEmailNotification from '../../components/VerifyEmailNotification';
import TalentLayerContext from '../../context/talentLayer';
import BuilderPlaceContext from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import UserContext from '../../modules/BuilderPlace/context/UserContext';
import { sharedGetServerSideProps } from '../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function Dashboard() {
  const account = useAccount();
  const { user: talentLayerUser } = useContext(TalentLayerContext); // Add refreshData
  const { user } = useContext(UserContext);
  const router = useRouter();
  const { isBuilderPlaceCollaborator, builderPlace } = useContext(BuilderPlaceContext);
  const isComingFromHirerOnboarding = router.asPath.includes('platformonboarding');

  if (!user) {
    return (
      <>
        {isComingFromHirerOnboarding ? (
          <div className='max-w-7xl mx-auto text-base-content text-center'>
            <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
              <div className='py-2 px-6 sm:px-0 w-full mb-8'>
                <p className='text-2xl font-bold flex-1 mt-6'>
                  <span className='text-base-content ml-1'> your new Builder Place is ready!</span>
                </p>
                <p>Please connect your wallet to your new custom domain to access your dashboard</p>
              </div>
            </div>
            <div className='p-8 flex flex-col items-center'>
              <ConnectBlock />
            </div>
          </div>
        ) : (
          !user && (
            <div className='max-w-7xl mx-auto text-base-content text-center'>
              <Steps />
            </div>
          )
        )}
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

      {account?.isConnected && talentLayerUser && (
        <div>
          {isBuilderPlaceCollaborator && (!builderPlace?.logo || !builderPlace?.icon) && (
            <>
              <div className='mb-12'>
                {isComingFromHirerOnboarding && (
                  <Notification
                    title='personalize your space!'
                    text='customize your Platform to match your brand'
                    link='/admin/configure-platform'
                    linkText='personalize my platform'
                    color='success'
                    imageUrl={user.picture}
                  />
                )}
              </div>

              <div className='mb-12'>
                <UserServices user={talentLayerUser} type='buyer' />
              </div>
            </>
          )}
          {!isBuilderPlaceCollaborator && (
            <>
              <VerifyEmailNotification
                callback={() => {
                  toast.success('Verification email sent!');
                }}
              />
              {process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE === 'true' && <DelegationNotification />}
              <div className='mb-12 mt-2'>
                <h2 className='pb-4 text-base-content  break-all flex justify-between items-center'>
                  <span className='flex-1 font-bold'>your profile</span>
                  <Link
                    className='hover:opacity-70 text-primary bg-primary px-3 py-2 text-sm  rounded-xl'
                    href={`/profiles/edit`}>
                    Edit
                  </Link>
                </h2>
                <UserDetail />
              </div>
              <div className='mb-12'>
                <UserPayments user={talentLayerUser} />
              </div>
              <div className='mb-12'>
                <UserGains user={talentLayerUser} />
              </div>
              <div className='mb-12'>
                <UserServices user={talentLayerUser} type='contributor' />
              </div>
              <div className='mb-12'>
                <UserServices user={talentLayerUser} type='seller' />
              </div>
              <div className='mb-12'>
                <UserProposals user={talentLayerUser} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
