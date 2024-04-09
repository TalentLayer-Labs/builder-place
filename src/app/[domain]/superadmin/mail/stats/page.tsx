import { CogIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { PaperAirplane } from 'heroicons-react';

import dynamic from 'next/dynamic';
import { useContext } from 'react';
import Loading from '../../../../../components/Loading';
import UserNeedsMoreRights from '../../../../../components/UserNeedsMoreRights';
import TalentLayerContext from '../../../../../context/talentLayer';
import BuilderPlaceContext from '../../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import useEmailStats from '../../../../../modules/Web3mail/hooks/useEmailStats';

const EmailNotificationsChart = dynamic(
  () => import('../../../../../modules/Web3mail/components/Web3mailChart'),
  {
    ssr: false,
  },
);

function EmailNotificationsStats() {
  const { user: talentLayerUser, loading } = useContext(TalentLayerContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { emailStats, loading: statsLoading } = useEmailStats();

  if (loading || !emailStats || !talentLayerUser) {
    return <Loading />;
  }
  if (talentLayerUser?.id != builderPlace?.owner.talentLayerId) {
    return <UserNeedsMoreRights />;
  }

  const SkeletonLoader = () => (
    <div className='w-full animate-pulse'>
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12 lg:col-span-6'>
          <div className='grid grid-cols-12 gap-6'>
            {[...Array(4)].map((_, index) => (
              <div key={index} className='bg-base-300 col-span-6 rounded-xl border border-info p-6'>
                <div className='h-8 bg-base-200 rounded mb-4'></div>{' '}
                <div className='space-y-4'>
                  <div className='h-4 bg-base-200 rounded'></div>
                  <div className='h-4 bg-base-200 rounded'></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='col-span-12 lg:col-span-6 bg-base-300 rounded-xl border border-info p-6'>
          <div className='h-8 bg-base-200 rounded mb-4'></div>
          <div className='h-52 bg-base-200 rounded'></div>
          <div className='h-max bg-base-200 rounded'></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className=' -mx-6 -mt-6 sm:mx-0 sm:mt-0'>
        <div className='flex py-2 px-6 sm:px-0 items-center w-full mb-8'>
          <p className='text-2xl font-bold flex-1 mt-6'>Email Notification Stats</p>
          <a
            href={`/superadmin/mail`}
            className='hover:opacity-70 text-primary bg-primary px-3 py-2 text-sm flex items-center rounded-xl'>
            <PaperAirplane width={18} height={18} className='w-[18px] h-[18px] mr-2' />
            Send
          </a>
        </div>
      </div>
      {statsLoading ? (
        <>
          <div className='flex mb-5 items-center justify-center space-x-2'>
            <span className='relative flex h-5 w-5 flex-shrink-0 items-center justify-center '>
              <span className='animate-ping absolute h-4 w-4 rounded-full bg-zinc-200' />
              <span className='relative block h-2 w-2 rounded-full bg-zinc-600' />
            </span>
            <span className='text-sm text-base-content'>Data loading...</span>
          </div>
          <SkeletonLoader />
        </>
      ) : (
        <div>
          <div className={`grid grid-cols-12 gap-6`}>
            <div className='bg-base-300 ltablet:col-span-6 col-span-12 lg:col-span-6 rounded-xl border border-info'>
              <div className='p-6'>
                <div className='mb-6'>
                  <h3 className='text-base-content'>
                    <span>Quick Stats</span>
                  </h3>
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='bg-base-200 flex items-center gap-2 rounded-xl px-5 py-10'>
                    <div className='p-4 rounded-full border-2 border-info/80 bg-info/20 text-primary'>
                      <PaperAirplane width={20} height={20} />
                    </div>
                    <div>
                      <h2 className='text-base-content'>
                        <span>{emailStats.totalSent}</span>
                      </h2>
                      <p className=''>
                        <span className='text-base-content'> Total sent </span>
                      </p>
                    </div>
                  </div>
                  <div className='bg-base-200 flex items-center gap-2 rounded-xl px-5 py-10'>
                    <div className='p-4 rounded-full border-2 border-info/80 bg-info/20 text-primary'>
                      <PaperAirplane width={20} height={20} />
                    </div>
                    <div>
                      <h2 className='text-base-content'>
                        <span>{emailStats.totalSentThisMonth}</span>
                      </h2>
                      <p className=''>
                        <span className='text-base-content'> sent this month </span>
                      </p>
                    </div>
                  </div>
                  <div className='bg-base-200 flex items-center gap-2 rounded-xl px-5 py-10'>
                    <div className='p-4 rounded-full border-2 border-info/80 bg-info/20 text-primary'>
                      <UserGroupIcon width={20} height={20} />
                    </div>
                    <div>
                      <h2 className='text-base-content'>
                        <span>{emailStats.totalContact}</span>
                      </h2>
                      <p className=''>
                        <span className='text-base-content'> contacts </span>
                      </p>
                    </div>
                  </div>
                  <div className='bg-base-200 flex items-center gap-2 rounded-xl px-5 py-10'>
                    <div className='p-4 rounded-full border-2 border-info/80 bg-info/20 text-primary'>
                      <CogIcon width={20} height={20} />
                    </div>
                    <div>
                      <h2 className='text-base-content'>
                        <span>{emailStats.totalCronRunning}</span>
                      </h2>
                      <p className=''>
                        <span className='text-base-content'> cron running </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-base-300 ltablet:col-span-6 col-span-12 lg:col-span-6 rounded-xl border border-info'>
              <div className='p-6'>
                <div className='mb-6'>
                  <h3 className='text-base-content'>
                    <span>Emails sent by month</span>
                  </h3>
                </div>
                <div className='-ms-4'>
                  {/**/}
                  <div className='vue-apexcharts' style={{ minHeight: 273 }}>
                    <EmailNotificationsChart totalSentByMonth={emailStats.totalSentByMonth} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailNotificationsStats;
