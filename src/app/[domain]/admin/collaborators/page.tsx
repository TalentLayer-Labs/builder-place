'use client';

import { useContext, useState } from 'react';
import AccessDenied from '../../../../components/AccessDenied';
import CollaboratorForm from '../../../../components/Form/CollaboratorForm';
import TalentLayerContext from '../../../../context/talentLayer';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';

import AdminSettingsLayout from '../../../../components/AdminSettingsLayout';
import CollaboratorCard from '../../../../components/CollaboratorCard';
import Loading from '../../../../components/Loading';
import { useConfig } from '../../../../hooks/useConfig';

export default function Collaborators() {
  const { user: talentLayerUser, loading } = useContext(TalentLayerContext);
  const delegates = talentLayerUser?.delegates;
  const config = useConfig();
  const { builderPlace } = useContext(BuilderPlaceContext);
  const [filter, setFilter] = useState('');

  if (loading) {
    return <Loading />;
  }

  if (talentLayerUser?.id != builderPlace?.owner.talentLayerId) {
    return <AccessDenied />;
  }

  return (
    <div>
      <AdminSettingsLayout title={'Collaborators'}>
        <div className={'flex flex-col'}>
          <CollaboratorForm />
          {builderPlace?.collaborators && builderPlace.collaborators.length > 1 && (
            <div className='mt-10'>
              <span className='text-base-content font-bold border-base-300 pb-2'>
                Collaborators
              </span>
              <div className='border-b border-base-300 mt-2 mb-4'></div>
              <input
                type='text'
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder='Filter by name or address'
                className='mt-1 mb-1 block w-full rounded-lg border-2 border-info bg-base-200 focus:ring-opacity-50'
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
                    talentLayerUser?.id && (
                      <CollaboratorCard
                        collaborator={collaborator}
                        userId={talentLayerUser.id}
                        delegates={delegates}
                        config={config}
                      />
                    )
                  );
                })}
            </div>
          )}
        </div>
      </AdminSettingsLayout>
    </div>
  );
}
