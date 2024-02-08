import { CogIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { PaperAirplane } from 'heroicons-react';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { useContext } from 'react';
import Loading from '../../../../components/Loading';
import Steps from '../../../../components/Steps';
import UserNeedsMoreRights from '../../../../components/UserNeedsMoreRights';
import TalentLayerContext from '../../../../context/talentLayer';
import useEmailStats from '../../../../modules/Web3mail/hooks/useEmailStats';
import { sharedGetServerSideProps } from '../../../../utils/sharedGetServerSideProps';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

const Web3mailChart = dynamic(
  () => import('../../../../modules/Web3mail/components/Web3mailChart'),
  {
    ssr: false,
  },
);

function Web3mailStats() {
  const { user, loading } = useContext(TalentLayerContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { emailStats, loading: statsLoading } = useEmailStats();
  console.log('statsLoading', statsLoading);

  if (loading || !emailStats) {
    return <Loading />;
  }
  if (!user) {
    return <Steps />;
  }
  if (user?.id != builderPlace?.owner.talentLayerId) {
    return <UserNeedsMoreRights />;
  }

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
      {statsLoading && (
        <div className='flex mb-5 items-center justify-center space-x-2'>
          <Loading />
          <span className='text-sm text-base-content'>Stats loading...</span>
        </div>
      )}
      <div>
        <div className='grid grid-cols-12 gap-6'>
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
                  <span>Web3mails sent by month</span>
                </h3>
              </div>
              <div className='-ms-4'>
                {/**/}
                <div className='vue-apexcharts' style={{ minHeight: 273 }}>
                  <Web3mailChart totalSentByMonth={emailStats.totalSentByMonth} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Web3mailStats;
