import AccessDenied from '../../../components/AccessDenied';
import { useContext, useState } from 'react';
import BuilderPlaceContext from '../../../modules/BuilderPlace/context/BuilderPlaceContext';
import CollaboratorForm from '../../../components/Form/CollaboratorForm';
import TalentLayerContext from '../../../context/talentLayer';
import { GetServerSidePropsContext } from 'next';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';
import { useRemoveBuilderPlaceOwnerMutation } from '../../../modules/BuilderPlace/hooks/UseRemoveBuilderPlaceOwner';
import { showErrorTransactionToast } from '../../../utils/toast';
import { toggleDelegation } from '../../../contracts/toggleDelegation';
import { useChainId } from '../../../hooks/useChainId';
import { useConfig } from '../../../hooks/useConfig';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import Loading from '../../../components/Loading';
import AdminSettingsLayout from '../../../components/AdminSettingsLayout';
import CollaboratorCard from './collaborator-card';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

export default function Collaborators() {
  const { user, account, refreshData } = useContext(TalentLayerContext);
  const delegates = user?.delegates;
  const { mutateAsync: removeBuilderPlaceCollaboratorAsync } = useRemoveBuilderPlaceOwnerMutation();
  const chainId = useChainId();
  const config = useConfig();
  const { data: walletClient } = useWalletClient({ chainId });
  const { open: openConnectModal } = useWeb3Modal();
  const { builderPlace } = useContext(BuilderPlaceContext);
  const publicClient = usePublicClient({ chainId });
  const [submitting, setSubmitting] = useState('');
  const [filter, setFilter] = useState('');

  if (user?.id != builderPlace?.owner.talentLayerId) {
    return <AccessDenied />;
  }

  if (!user?.id) {
    return <Loading />;
  }
  console.log(delegates);
  const onRemove = async (address: string): Promise<void> => {
    try {
      if (walletClient && account?.address && builderPlace?.id) {
        setSubmitting(address);

        if (user.delegates?.indexOf(address) !== -1) {
          /**
           * @dev Remove the new collaborator as a delegate to the BuilderPlace owner
           */
          await toggleDelegation(
            chainId,
            user.id,
            config,
            address,
            publicClient,
            walletClient,
            false,
          );
        }

        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          account: account.address,
          message: `connect with ${account.address}`,
        });

        /**
         * @dev Remove new collaborator from the BuilderPlace
         */
        const response = await removeBuilderPlaceCollaboratorAsync({
          ownerId: user.id,
          builderPlaceId: builderPlace.id,
          collaboratorAddress: address.toLocaleLowerCase(),
          address: account.address,
          signature,
        });

        if (response?.error) {
          showErrorTransactionToast(response.error);
        }
        if (delegates?.includes(address.toLowerCase())) {
          /**
           * @dev Remove the new collaborator as a delegate to the BuilderPlace owner
           */
          await toggleDelegation(
            chainId,
            user.id,
            config,
            address,
            publicClient,
            walletClient,
            false,
          );
        }
      } else {
        openConnectModal();
      }
    } catch (error) {
      console.log(error);
      showErrorTransactionToast(error);
    } finally {
      refreshData();
      setSubmitting('');
    }
  };

  return (
    <div>
      <AdminSettingsLayout title={'Collaborators'}>
        <div className={'flex flex-col'}>
          <CollaboratorForm />
          <div className='mt-10'>
            <span className='text-base-content font-bold border-base-300 border-b-4 pb-2'>
              Collaborators
            </span>
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
                    publicClient={publicClient}
                    userId={user.id}
                    chainId={chainId}
                    delegates={delegates}
                    config={config}
                    walletClient={walletClient}
                    onRemove={onRemove}
                  />
                );
              })}
          </div>
        </div>
      </AdminSettingsLayout>
    </div>
  );
}
