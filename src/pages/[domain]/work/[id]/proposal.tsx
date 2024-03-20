import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import ProposalForm from '../../../../components/Form/ProposalForm';
import Loading from '../../../../components/Loading';
import NotFound from '../../../../components/NotFound';
import Steps from '../../../../components/Steps';
import TalentLayerContext from '../../../../context/talentLayer';
import useProposalById from '../../../../hooks/useProposalById';
import useServiceById from '../../../../hooks/useServiceById';
import ConnectButton from '../../../../modules/Messaging/components/ConnectButton';
import MessagingContext from '../../../../modules/Messaging/context/messging';
import { ProposalStatusEnum, ServiceStatusEnum } from '../../../../types';
import { sharedGetServerSideProps } from '../../../../utils/sharedGetServerSideProps';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function CreateOrEditProposal() {
  const { account, user } = useContext(TalentLayerContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { userExists } = useContext(MessagingContext);
  const router = useRouter();
  const { id } = router.query;
  const { service, isLoading } = useServiceById(id as string);
  const existingProposal = useProposalById(`${id}-${user?.id}`);

  if (isLoading) {
    return <Loading />;
  }

  if (!service) {
    return <NotFound />;
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
          <ProposalForm user={user} service={service} existingProposal={existingProposal} />
        )}
    </div>
  );
}

export default CreateOrEditProposal;
