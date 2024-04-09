'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { useAccount } from 'wagmi';
import TalentLayerContext from '../../context/talentLayer';
import BuilderPlaceContext from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import UserContext from '../../modules/BuilderPlace/context/UserContext';
import ConnectBlock from '../ConnectBlock';
import DashboardUserServices from '../DashboardUserServices';
import DelegationNotification from '../DelegationNotification';
import Notification from '../Notification';
import Steps from '../Steps';
import UserDetail from '../UserDetail';
import UserGains from '../UserGains';
import UserPayments from '../UserPayments';
import UserProposals from '../UserProposals';
import VerifyEmailNotification from '../VerifyEmailNotification';

function PlatformDashboard() {
  const account = useAccount();
  const { user: talentLayerUser } = useContext(TalentLayerContext); // Add refreshData
  const { user, getUser } = useContext(UserContext);
  const { isBuilderPlaceCollaborator, builderPlace } = useContext(BuilderPlaceContext);
  const searchParams = useSearchParams();
  const isComingFromHirerOnboarding = !!searchParams?.get('platformonboarding');

  useEffect(() => {
    getUser();
  }, [account.address]);

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
          <div className='max-w-7xl mx-auto text-base-content text-center'>
            <Steps />
          </div>
        )}
      </>
    );
  }

  if (!builderPlace) {
    return null;
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
          <div className='mb-12'>
            <VerifyEmailNotification />
            {process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE === 'true' && <DelegationNotification />}
          </div>

          {isBuilderPlaceCollaborator && (
            <>
              {(!builderPlace.logo || !builderPlace.icon) && (
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
              )}

              <div className='mb-12 mt-2'>
                <DashboardUserServices userId={builderPlace.owner.talentLayerId} type='buyer' />
              </div>
            </>
          )}
          {!isBuilderPlaceCollaborator && (
            <>
              <div className='mb-12 mt-2'>
                <h2 className='pb-4 text-base-content  break-all flex justify-between items-center'>
                  <span className='flex-1 font-bold'>your profile</span>
                  <Link
                    className='hover:opacity-70 text-primary bg-primary px-3 py-2 text-sm rounded-xl'
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
                <DashboardUserServices userId={user.talentLayerId} type='seller' />
              </div>
              {builderPlace.jobPostingConditions?.allowPosts && (
                <div className='mb-12 mt-2'>
                  <DashboardUserServices userId={user.talentLayerId} type='buyer' />
                </div>
              )}
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

export default PlatformDashboard;
