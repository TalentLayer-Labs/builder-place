import { GetServerSidePropsContext } from 'next';
import { useContext } from 'react';
import AccessDenied from '../../../components/AccessDenied';
import ServiceForm from '../../../components/Form/ServiceForm';
import Steps from '../../../components/Steps';
import TalentLayerContext from '../../../context/talentLayer';
import BuilderPlaceContext from '../../../modules/BuilderPlace/context/BuilderPlaceContext';
import ConnectButton from '../../../modules/Messaging/components/ConnectButton';
import MessagingContext from '../../../modules/Messaging/context/messging';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';
import useCheckJobPostConditions from '../../../hooks/useCheckJobPostConditions';
import Loading from '../../../components/Loading';
import ConditionsStatusCard from '../../../components/CreateService/ConditionsStatusCard ';
import { useAccount } from 'wagmi';
import UserContext from '../../../modules/BuilderPlace/context/UserContext';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function CreateService() {
  const account = useAccount();
  const { user } = useContext(UserContext);
  const { userExists } = useContext(MessagingContext);
  const { isBuilderPlaceCollaborator, builderPlace } = useContext(BuilderPlaceContext);
  const { returnedPostingConditions, isLoading, canPost } = useCheckJobPostConditions(
    builderPlace?.jobPostingConditions?.allowPosts,
    builderPlace?.jobPostingConditions?.conditions,
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Steps />;
  }

  if (!builderPlace?.jobPostingConditions.allowPosts && !isBuilderPlaceCollaborator) {
    return <AccessDenied />;
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      {/* Will not appear for collaborators */}
      {builderPlace?.jobPostingConditions.allowPosts && !isBuilderPlaceCollaborator && (
        <div className='border border-info rounded-xl p-4 mb-6'>
          <h3 className='text-lg font-semibold mb-3'>Posting Conditions</h3>
          <ul>
            {returnedPostingConditions.map(condition => (
              <ConditionsStatusCard key={condition.condition.address} {...condition} />
            ))}
          </ul>
        </div>
      )}

      {(isBuilderPlaceCollaborator || canPost) && (
        <>
          <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
            <p className='flex py-2 items-center text-2xl font-bold tracking-wider mb-6 w-full px-6 sm:px-0 mt-6 '>
              post a <span className='text-base-content ml-1'>mission </span>
            </p>
          </div>

          {!userExists() && account?.isConnected && user && (
            <div className='border border-info rounded-xl p-8'>
              <p className='text-base-content opacity-50 py-4'>
                First, let's set up decentralized messaging for your organization so that you can
                message with open-source contributors about your missions. decentralized messaging
                on BuilderPlace platforms is powered by{' '}
                <a className='underline' href='https://xmtp.org/' target='_blank'>
                  XMTP
                </a>
                .
              </p>
              <ConnectButton />
            </div>
          )}

          {account?.isConnected && user && userExists() && <ServiceForm />}
        </>
      )}
    </div>
  );
}

export default CreateService;
