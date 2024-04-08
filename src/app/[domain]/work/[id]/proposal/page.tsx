import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { useAccount } from 'wagmi';
import AccessDenied from '../../../../../components/AccessDenied';
import ProposalForm from '../../../../../components/Form/ProposalForm';
import Loading from '../../../../../components/Loading';
import NotFound from '../../../../../components/NotFound';
import Steps from '../../../../../components/Steps';
import useProposalById from '../../../../../hooks/useProposalById';
import useServiceById from '../../../../../hooks/useServiceById';
import BuilderPlaceContext from '../../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import UserContext from '../../../../../modules/BuilderPlace/context/UserContext';
import ConnectButton from '../../../../../modules/Messaging/components/ConnectButton';
import MessagingContext from '../../../../../modules/Messaging/context/messging';
import { ProposalStatusEnum, ServiceStatusEnum } from '../../../../../types';
import { sharedGetServerSideProps } from '../../../../../utils/sharedGetServerSideProps';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function CreateOrEditProposal() {
  const account = useAccount();
  const { user, loading } = useContext(UserContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { userExists } = useContext(MessagingContext);
  const router = useRouter();
  const { id } = router.query;
  const { service, isLoading } = useServiceById(id as string);
  const existingProposal = useProposalById(`${id}-${user?.talentLayerId}`);

  if (isLoading || loading) {
    return <Loading />;
  }

  if (!service) {
    return <NotFound />;
  }

  if (builderPlace?.talentLayerPlatformId !== service?.platform?.id) {
    return <NotFound />;
  }

  if (user?.talentLayerId === service.buyer.id) {
    return <AccessDenied customText={"You can't post a proposal for your own service."} />;
  }

  if (!user) {
    return <Steps />;
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
        <p className='flex py-2 items-center text-2xl font-bold tracking-wider mb-6 w-full px-6 sm:px-0 mt-6 '>
          {existingProposal &&
          existingProposal.status === ProposalStatusEnum.Pending &&
          service.status === ServiceStatusEnum.Opened ? (
            <>edit your proposal</>
          ) : service.status !== ServiceStatusEnum.Opened ? (
            <>
              This service is not <span className='text-base-content'>open </span> for proposals any
              more
            </>
          ) : (
            <>create a proposal</>
          )}
        </p>
      </div>

      {!userExists() && account?.isConnected && user && (
        <div className='border border-info rounded-xl p-8'>
          <p className='text-base-content opacity-50 py-4'>
            In order to create a proposal, you need to be registered to our decentralized messaging
            service. Please sign in to our messaging service to verify your identity :
          </p>
          <ConnectButton />
        </div>
      )}

      {userExists() &&
        account?.isConnected &&
        user &&
        service.status === ServiceStatusEnum.Opened && (
          <ProposalForm service={service} existingProposal={existingProposal} />
        )}
    </div>
  );
}

export default CreateOrEditProposal;
