import { ChartBarIcon } from '@heroicons/react/24/outline';
import { GetServerSidePropsContext } from 'next';
import { useContext } from 'react';
import { ContactListForm } from '../../../../components/Form/ContactSelectForm';
import Loading from '../../../../components/Loading';
import Steps from '../../../../components/Steps';
import UserNeedsMoreRights from '../../../../components/UserNeedsMoreRights';
import TalentLayerContext from '../../../../context/talentLayer';
import { sharedGetServerSideProps } from '../../../../utils/sharedGetServerSideProps';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import { EmailNotificationType } from '../../../../types';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function Mail() {
  const { user, account, loading } = useContext(TalentLayerContext);
  const { builderPlace, isBuilderPlaceCollaborator } = useContext(BuilderPlaceContext);
  const emailNotificationType =
    process.env.NEXT_PUBLIC_EMAIL_MODE === 'web3'
      ? EmailNotificationType.WEB3
      : EmailNotificationType.WEB2;

  if (loading) {
    return <Loading />;
  }
  if (!user) {
    return <Steps />;
  }
  if (!isBuilderPlaceCollaborator) {
    return <UserNeedsMoreRights />;
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className=' -mx-6 -mt-6 sm:mx-0 sm:mt-0'>
        <div className='flex py-2 px-6 sm:px-0 items-center w-full mb-8'>
          <p className='text-2xl font-bold flex-1 mt-6'>
            Send{' '}
            <span className='text-base-content ml-1'>
              {emailNotificationType === EmailNotificationType.WEB3 && 'Web3mails'}
              {emailNotificationType === EmailNotificationType.WEB2 && 'Mails'}
            </span>
          </p>
          <a
            href={`/admin/mail/stats`}
            className='text-base-content bg-base-300 px-3 py-2 text-sm flex items-center rounded-xl'>
            <ChartBarIcon width={18} height={18} className='w-[18px] h-[18px] mr-2' />
            Stats
          </a>
        </div>
      </div>
      {builderPlace && (
        <ContactListForm
          builderPlaceId={builderPlace?.id}
          userId={user.id}
          address={account?.address}
        />
      )}
    </div>
  );
}

export default Mail;
