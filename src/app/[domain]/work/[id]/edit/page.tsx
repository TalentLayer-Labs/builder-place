import { useRouter, useSearchParams } from 'next/navigation';
import { useContext } from 'react';
import { useAccount } from 'wagmi';
import AccessDenied from '../../../../../components/AccessDenied';
import ServiceForm from '../../../../../components/Form/ServiceForm';
import Loading from '../../../../../components/Loading';
import NotFound from '../../../../../components/NotFound';
import Steps from '../../../../../components/Steps';
import TalentLayerContext from '../../../../../context/talentLayer';
import useServiceById from '../../../../../hooks/useServiceById';
import BuilderPlaceContext from '../../../../../modules/BuilderPlace/context/BuilderPlaceContext';

function EditService() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const { service, isLoading } = useServiceById(id as string);
  const account = useAccount();
  const { user: talentLayerUser } = useContext(TalentLayerContext);
  const { isBuilderPlaceCollaborator, builderPlace } = useContext(BuilderPlaceContext);

  const canEditService =
    (isBuilderPlaceCollaborator && service?.buyer.id === builderPlace?.owner.talentLayerId) ||
    talentLayerUser?.id === service?.buyer.id;

  if (isLoading) {
    return <Loading />;
  }

  if (!talentLayerUser) {
    return <Steps />;
  }

  if (!canEditService) {
    return <AccessDenied />;
  }

  if (!service) {
    return <NotFound />;
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
        <p className='flex py-2 items-center text-2xl font-bold tracking-wider mb-6 w-full px-6 sm:px-0 mt-6 '>
          Edit <span className='text-base-content ml-1'>mission #{service.id} </span>
        </p>
      </div>

      {account?.isConnected && talentLayerUser && <ServiceForm existingService={service} />}
    </div>
  );
}

export default EditService;
