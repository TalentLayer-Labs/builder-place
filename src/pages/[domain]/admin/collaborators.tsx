import AccessDenied from '../../../components/AccessDenied';
import { useContext, useState } from 'react';
import BuilderPlaceContext from '../../../modules/BuilderPlace/context/BuilderPlaceContext';
import CollaboratorForm from '../../../components/Form/CollaboratorForm';
import TalentLayerContext from '../../../context/talentLayer';
import { GetServerSidePropsContext } from 'next';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';
import { useConfig } from '../../../hooks/useConfig';
import Loading from '../../../components/Loading';
import AdminSettingsLayout from '../../../components/AdminSettingsLayout';
import CollaboratorCard from './collaborator-card';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

export default function Collaborators() {
  const { user: talentLayerUser } = useContext(TalentLayerContext);
  const delegates = talentLayerUser?.delegates;
  const config = useConfig();
  const { builderPlace } = useContext(BuilderPlaceContext);
  const [filter, setFilter] = useState('');

  if (talentLayerUser?.id != builderPlace?.owner.talentLayerId) {
    return <AccessDenied />;
  }

  if (!talentLayerUser?.id) {
    return <Loading />;
  }

  return (
    <div>
      <AdminSettingsLayout title={'Collaborators'}>
        <div className={'flex flex-col'}>
          <CollaboratorForm />
          <div className='mt-10'>
            <span className='text-base-content font-bold border-base-300 pb-2'>Collaborators</span>
            <div className='border-b border-base-300 mt-2 mb-4'></div>
            <input
              type='text'
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder='Filter by name or address'
              className='mt-1 mb-1 block w-full rounded-lg border border-info bg-base-200 focus:ring-opacity-50'
            />

            {builderPlace?.collaborators
              ?.filter(
                collaborator =>
                  collaborator.name.toLowerCase().includes(filter.toLowerCase()) ||
                  collaborator.address?.toLowerCase().includes(filter.toLowerCase()),
              )
              .map(collaborator => {
                if (collaborator.id === builderPlace.owner.id) {
                  return null;
                }

                return (
                  <CollaboratorCard
                    collaborator={collaborator}
                    userId={talentLayerUser.id}
                    delegates={delegates}
                    config={config}
                  />
                );
              })}
          </div>
        </div>
      </AdminSettingsLayout>
    </div>
  );
}
